import type { Request } from 'express';
import type { UploadedImageFile } from '../../../application/use-cases/media/upload-image-files.use-case';

type MulterFiles = {
  [field: string]: Express.Multer.File[] | undefined;
};

export function isMultipartRequest(req: Request): boolean {
  const contentType = req.headers['content-type'] ?? '';
  return contentType.toLowerCase().includes('multipart/form-data');
}

export function extractUploadedImageFiles(req: Request, allowedFields: string[]): UploadedImageFile[] {
  const files = req.files as MulterFiles | undefined;
  if (!files) return [];

  const out: UploadedImageFile[] = [];
  for (const field of allowedFields) {
    const list = files[field] ?? [];
    for (const file of list) {
      out.push({
        field,
        originalName: file.originalname,
        mimeType: file.mimetype,
        buffer: file.buffer,
      });
    }
  }
  return out;
}

export function hasUploadedImageFiles(req: Request, allowedFields: string[]): boolean {
  return extractUploadedImageFiles(req, allowedFields).length > 0;
}

export function requestBodyRecord(req: Request): Record<string, unknown> {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return { ...(req.body as Record<string, unknown>) };
  }
  return {};
}
