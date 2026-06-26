import { randomUUID } from 'crypto';
import path from 'path';
import {
  ANAMNESIS_EXCLUSIVE_FILE_FIELDS,
  type AnamnesisExclusiveFileField,
} from '../../anamnesis-exclusive/anamnesis-exclusive-file-fields';
import type { AnamnesisExclusiveUpsertValues } from '../../ports/anamnesis-exclusive.port';
import type { IObjectStorage } from '../../ports/object-storage.port';

const VALIDATION = 'ValidationException';
const STORAGE = 'ObjectStorageException';

export type AnamnesisExclusiveUploadedFile = {
  field: AnamnesisExclusiveFileField;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
};

export class UploadAnamnesisExclusiveFilesUseCase {
  constructor(private readonly storage: IObjectStorage | null) {}

  async execute(
    studentId: string,
    files: AnamnesisExclusiveUploadedFile[]
  ): Promise<AnamnesisExclusiveUpsertValues> {
    if (files.length === 0) return {};
    if (!this.storage) {
      const err = new Error('Armazenamento de arquivos não configurado (S3_BUCKET).');
      err.name = STORAGE;
      throw err;
    }

    const grouped = this.groupByField(files);
    const out: AnamnesisExclusiveUpsertValues = {};

    for (const field of Object.keys(ANAMNESIS_EXCLUSIVE_FILE_FIELDS) as AnamnesisExclusiveFileField[]) {
      const list = grouped.get(field) ?? [];
      const config = ANAMNESIS_EXCLUSIVE_FILE_FIELDS[field];
      if (list.length === 0) continue;
      if (list.length > config.maxCount) {
        const err = new Error(
          `Campo "${field}" aceita no máximo ${config.maxCount} arquivo(s); recebidos ${list.length}.`
        );
        err.name = VALIDATION;
        throw err;
      }

      const urls: string[] = [];
      for (const file of list) {
        const key = this.buildObjectKey(studentId, field, file.originalName);
        try {
          const url = await this.storage.putObject({
            key,
            body: file.buffer,
            contentType: file.mimeType || 'application/octet-stream',
          });
          urls.push(url);
        } catch (uploadErr) {
          throw this.toStorageError(uploadErr);
        }
      }

      out[field] = config.multiple ? JSON.stringify(urls) : urls[0]!;
    }

    return out;
  }

  private groupByField(
    files: AnamnesisExclusiveUploadedFile[]
  ): Map<AnamnesisExclusiveFileField, AnamnesisExclusiveUploadedFile[]> {
    const grouped = new Map<AnamnesisExclusiveFileField, AnamnesisExclusiveUploadedFile[]>();
    for (const file of files) {
      if (!(file.field in ANAMNESIS_EXCLUSIVE_FILE_FIELDS)) {
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

  private buildObjectKey(studentId: string, field: string, originalName: string): string {
    const ext = path.extname(originalName).slice(0, 32).replace(/[^a-zA-Z0-9.]/g, '');
    return `anamnesis-exclusive/${studentId}/${field}/${randomUUID()}${ext}`;
  }

  private toStorageError(err: unknown): Error {
    const aws = err as { name?: string; Code?: string; message?: string };
    const code = aws.name ?? aws.Code ?? '';
    if (code === 'AccessDenied') {
      const storageErr = new Error(
        'Usuário AWS sem permissão s3:PutObject no bucket configurado (prefixo anamnesis-exclusive/*).'
      );
      storageErr.name = STORAGE;
      return storageErr;
    }
    const storageErr = new Error(aws.message ?? 'Falha ao enviar arquivo para o S3.');
    storageErr.name = STORAGE;
    return storageErr;
  }
}

export { STORAGE as ObjectStorageException };
