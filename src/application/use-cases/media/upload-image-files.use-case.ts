import { randomUUID } from 'crypto';
import path from 'path';
import {
  IMAGE_UPLOAD_MIME_TYPES,
  type ImageUploadFieldConfig,
} from '../../media/image-upload.config';
import type { IObjectStorage } from '../../ports/object-storage.port';

const VALIDATION = 'ValidationException';
export const OBJECT_STORAGE_EXCEPTION = 'ObjectStorageException';

export type UploadedImageFile = {
  field: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
};

export class UploadImageFilesUseCase {
  constructor(private readonly storage: IObjectStorage | null) {}

  async execute(
    scopeId: string,
    storagePrefix: string,
    files: UploadedImageFile[],
    allowedFields: ImageUploadFieldConfig
  ): Promise<Record<string, string>> {
    if (files.length === 0) return {};
    if (!this.storage) {
      const err = new Error('Armazenamento de arquivos não configurado (S3_BUCKET).');
      err.name = OBJECT_STORAGE_EXCEPTION;
      throw err;
    }

    const grouped = this.groupByField(files, allowedFields);
    const out: Record<string, string> = {};

    for (const field of Object.keys(allowedFields)) {
      const list = grouped.get(field) ?? [];
      if (list.length === 0) continue;
      const maxCount = allowedFields[field]!.maxCount;
      if (list.length > maxCount) {
        const err = new Error(
          `Campo "${field}" aceita no máximo ${maxCount} arquivo(s); recebidos ${list.length}.`
        );
        err.name = VALIDATION;
        throw err;
      }

      const file = list[0]!;
      this.assertImageMime(file);
      const key = this.buildObjectKey(storagePrefix, scopeId, field, file.originalName);
      try {
        out[field] = await this.storage.putObject({
          key,
          body: file.buffer,
          contentType: file.mimeType || 'application/octet-stream',
        });
      } catch (uploadErr) {
        throw this.toStorageError(uploadErr, storagePrefix);
      }
    }

    return out;
  }

  private groupByField(
    files: UploadedImageFile[],
    allowedFields: ImageUploadFieldConfig
  ): Map<string, UploadedImageFile[]> {
    const grouped = new Map<string, UploadedImageFile[]>();
    for (const file of files) {
      if (!(file.field in allowedFields)) {
        const err = new Error(`Campo de arquivo "${file.field}" não é permitido.`);
        err.name = VALIDATION;
        throw err;
      }
      const list = grouped.get(file.field) ?? [];
      list.push(file);
      grouped.set(file.field, list);
    }
    return grouped;
  }

  private assertImageMime(file: UploadedImageFile): void {
    const mime = file.mimeType?.toLowerCase() ?? '';
    if (!IMAGE_UPLOAD_MIME_TYPES.has(mime)) {
      const err = new Error(
        `Arquivo "${file.field}" deve ser imagem (${[...IMAGE_UPLOAD_MIME_TYPES].join(', ')}).`
      );
      err.name = VALIDATION;
      throw err;
    }
  }

  private buildObjectKey(prefix: string, scopeId: string, field: string, originalName: string): string {
    const ext = path.extname(originalName).slice(0, 32).replace(/[^a-zA-Z0-9.]/g, '');
    return `${prefix}/${scopeId}/${field}/${randomUUID()}${ext}`;
  }

  private toStorageError(err: unknown, prefix: string): Error {
    const aws = err as { name?: string; Code?: string; message?: string };
    const code = aws.name ?? aws.Code ?? '';
    if (code === 'AccessDenied') {
      const storageErr = new Error(
        `Usuário AWS sem permissão s3:PutObject no bucket configurado (prefixo ${prefix}/*).`
      );
      storageErr.name = OBJECT_STORAGE_EXCEPTION;
      return storageErr;
    }
    const storageErr = new Error(aws.message ?? 'Falha ao enviar arquivo para o S3.');
    storageErr.name = OBJECT_STORAGE_EXCEPTION;
    return storageErr;
  }
}
