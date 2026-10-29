import type { Request } from 'express';
import type { ImageUploadFieldConfig } from '../../../application/media/image-upload.config';
import { normalizeExerciseRequestBody } from '../../../application/parsing/exercise-body.parsing';
import type { UploadImageFilesUseCase } from '../../../application/use-cases/media/upload-image-files.use-case';
import { mergeImageUploadsIntoBody } from './merge-image-uploads';

export async function mergeExerciseCreateOrPatchBody(
  req: Request,
  upload: UploadImageFilesUseCase,
  trainerId: string,
  storagePrefix: string,
  fieldConfig: ImageUploadFieldConfig
): Promise<Record<string, unknown>> {
  const merged = await mergeImageUploadsIntoBody(
    req,
    upload,
    trainerId,
    storagePrefix,
    fieldConfig
  );
  return normalizeExerciseRequestBody(merged);
}
