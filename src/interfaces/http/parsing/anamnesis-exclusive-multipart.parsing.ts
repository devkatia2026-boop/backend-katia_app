import type { Request } from 'express';
import {
  ANAMNESIS_EXCLUSIVE_FILE_FIELDS,
  type AnamnesisExclusiveFileField,
} from '../../../application/anamnesis-exclusive/anamnesis-exclusive-file-fields';
import type { AnamnesisExclusiveUploadedFile } from '../../../application/use-cases/anamnesis-exclusive/upload-anamnesis-exclusive-files.use-case';

type MulterFiles = {
  [field: string]: Express.Multer.File[] | undefined;
};

export function extractAnamnesisExclusiveUploadedFiles(req: Request): AnamnesisExclusiveUploadedFile[] {
  const files = req.files as MulterFiles | undefined;
  if (!files) return [];

  const out: AnamnesisExclusiveUploadedFile[] = [];
  for (const field of Object.keys(ANAMNESIS_EXCLUSIVE_FILE_FIELDS) as AnamnesisExclusiveFileField[]) {
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

export function hasUploadedAnamnesisExclusiveFiles(req: Request): boolean {
  return extractAnamnesisExclusiveUploadedFiles(req).length > 0;
}
