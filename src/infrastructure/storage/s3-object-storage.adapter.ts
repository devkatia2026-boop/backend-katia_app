import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { IObjectStorage, StoredObjectInput } from '../../application/ports/object-storage.port';

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

  async putObject(input: StoredObjectInput): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      })
    );
    return this.buildPublicUrl(input.key);
  }

  private buildPublicUrl(key: string): string {
    const base = this.config.publicBaseUrl?.replace(/\/$/, '');
    if (base) return `${base}/${key}`;
    return `https://${this.config.bucket}.s3.${this.config.region}.amazonaws.com/${key}`;
  }
}
