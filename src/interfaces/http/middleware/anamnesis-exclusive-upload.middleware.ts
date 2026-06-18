import multer from 'multer';
import type { RequestHandler } from 'express';
import {
  ANAMNESIS_EXCLUSIVE_FILE_FIELDS,
  ANAMNESIS_EXCLUSIVE_MAX_FILE_BYTES,
  ANAMNESIS_EXCLUSIVE_MAX_FILES,
  type AnamnesisExclusiveFileField,
} from '../../../application/anamnesis-exclusive/anamnesis-exclusive-file-fields';

const multerFields = (Object.keys(ANAMNESIS_EXCLUSIVE_FILE_FIELDS) as AnamnesisExclusiveFileField[]).map(
  (name) => ({
    name,
    maxCount: ANAMNESIS_EXCLUSIVE_FILE_FIELDS[name].maxCount,
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: ANAMNESIS_EXCLUSIVE_MAX_FILE_BYTES,
    files: ANAMNESIS_EXCLUSIVE_MAX_FILES,
  },
}).fields(multerFields);

export function createAnamnesisExclusiveUploadMiddleware(): RequestHandler {
  return (req, res, next) => {
    upload(req, res, (err: unknown) => {
      if (!err) {
        next();
        return;
      }
      if (err instanceof multer.MulterError) {
        const message =
          err.code === 'LIMIT_FILE_SIZE'
            ? `Arquivo excede o limite de ${ANAMNESIS_EXCLUSIVE_MAX_FILE_BYTES / (1024 * 1024)} MB.`
            : err.code === 'LIMIT_FILE_COUNT'
              ? `Número máximo de arquivos excedido (${ANAMNESIS_EXCLUSIVE_MAX_FILES}).`
              : err.message;
        res.status(400).json({ message });
        return;
      }
      next(err);
    });
  };
}
