import multer from 'multer';
import type { RequestHandler } from 'express';
import {
  IMAGE_UPLOAD_MAX_BYTES,
} from '../../../application/media/image-upload.config';

export function createImageUploadMiddleware(fieldNames: string[]): RequestHandler {
  const fields = fieldNames.map((name) => ({ name, maxCount: 1 }));
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: IMAGE_UPLOAD_MAX_BYTES,
      files: fieldNames.length,
    },
  }).fields(fields);

  return (req, res, next) => {
    upload(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        console.warn('[image-upload] multer:', err.code, err.message, { fields: fieldNames });
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? `Arquivo excede o limite de ${IMAGE_UPLOAD_MAX_BYTES / (1024 * 1024)} MB.`
            : err.code === 'LIMIT_FILE_COUNT'
              ? `Número máximo de arquivos excedido (${fieldNames.length}).`
              : err.message;
        res.status(400).json({ message });
        return;
      }
      next(err);
    });
  };
}
