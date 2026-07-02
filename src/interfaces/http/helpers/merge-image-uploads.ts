import type { Request } from 'express';
import type { ImageUploadFieldConfig } from '../../../application/media/image-upload.config';
import type { UploadImageFilesUseCase } from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  extractUploadedImageFiles,
  isMultipartRequest,
  requestBodyRecord,
} from '../parsing/image-multipart.parsing';

export async function mergeImageUploadsIntoBody(
  req: Request,
  upload: UploadImageFilesUseCase,
  scopeId: string,
  storagePrefix: string,
  fieldConfig: ImageUploadFieldConfig
): Promise<Record<string, unknown>> {
  const body = requestBodyRecord(req);
  if (!isMultipartRequest(req)) {
    console.log('[image-upload] merge: JSON (sem multipart)', { storagePrefix, scopeId });
    return body;
  }

  const allowedFields = Object.keys(fieldConfig);
  const files = extractUploadedImageFiles(req, allowedFields);
  console.log('[image-upload] merge: multipart', {
    storagePrefix,
    scopeId,
    fileCount: files.length,
    files: files.map((f) => ({ field: f.field, mimeType: f.mimeType, bytes: f.buffer.length })),
  });
  if (files.length === 0) {
    console.warn('[image-upload] merge: multipart sem arquivo nos campos', {
      storagePrefix,
      allowedFields,
      bodyKeys: Object.keys(body),
    });
    return body;
  }

  const urls = await upload.execute(scopeId.toLowerCase(), storagePrefix, files, fieldConfig);
  console.log('[image-upload] merge: urls retornadas', { storagePrefix, scopeId, urls });
  return { ...body, ...urls };
}
