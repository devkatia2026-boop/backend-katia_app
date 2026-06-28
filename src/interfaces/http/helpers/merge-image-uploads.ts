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
  if (!isMultipartRequest(req)) return body;

  const allowedFields = Object.keys(fieldConfig);
  const files = extractUploadedImageFiles(req, allowedFields);
  if (files.length === 0) return body;

  const urls = await upload.execute(scopeId.toLowerCase(), storagePrefix, files, fieldConfig);
  return { ...body, ...urls };
}
