import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { resolveOwnedS3ObjectKey } from '../../application/media/resolve-owned-s3-object-key';
import { REMOTE_MEDIA } from '../../application/media/fetch-remote-media';
import type {
  IObjectStorage,
  StoredObjectInput,
  StoredObjectOutput,
} from '../../application/ports/object-storage.port';

export type S3ObjectStorageConfig = {
  bucket: string;
  region: string;
  publicBaseUrl?: string;
};

export class S3ObjectStorageAdapter implements IObjectStorage {
  private readonly client: S3Client;

  constructor(private readonly config: S3ObjectStorageConfig) {
    this.client = new S3Client({ region: config.region });
  }

  async getObjectByPublicUrl(url: string): Promise<StoredObjectOutput | null> {
    const key = resolveOwnedS3ObjectKey(url, {
      bucket: this.config.bucket,
      publicBaseUrl: this.config.publicBaseUrl,
    });

    if (!key) {
      return null;
    }

    let response;

    try {
      response = await this.client.send(
        new GetObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
        }),
      );
    } catch {
      const err = new Error('Falha ao carregar mídia remota.');
      err.name = REMOTE_MEDIA;
      throw err;
    }

    if (!response.Body) {
      const err = new Error('Arquivo remoto vazio.');
      err.name = REMOTE_MEDIA;
      throw err;
    }

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    if (buffer.length === 0) {
      const err = new Error('Arquivo remoto vazio.');
      err.name = REMOTE_MEDIA;
      throw err;
    }

    return {
      buffer,
      contentType: response.ContentType ?? null,
    };
  }

  async putObject(input: StoredObjectInput): Promise<string> {
    const url = this.buildPublicUrl(input.key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      })
    );
    console.log('[s3] PutObject', {
      bucket: this.config.bucket,
      key: input.key,
      contentType: input.contentType,
      bytes: input.body.length,
      url,
    });
    return url;
  }

  private buildPublicUrl(key: string): string {
    const base = this.config.publicBaseUrl?.replace(/\/$/, '');
    if (base) return `${base}/${key}`;
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}
