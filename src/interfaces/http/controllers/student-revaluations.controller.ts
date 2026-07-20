import type { Request, Response } from 'express';
import type { CreateMyRevaluationUseCase } from '../../../application/use-cases/student/create-my-revaluation.use-case';
import type { GetMyRevaluationStatusUseCase } from '../../../application/use-cases/student/get-my-revaluation-status.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  REVALUATION_IMAGE_FIELDS,
  S3_PREFIX_REVALUATION,
} from '../../../application/media/image-upload.config';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';

export class StudentRevaluationsController {
  constructor(
    private readonly createMyRevaluation: CreateMyRevaluationUseCase,
    private readonly getMyRevaluationStatus: GetMyRevaluationStatusUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const result = await this.getMyRevaluationStatus.execute(studentId);
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao obter status de reavaliação.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        studentId,
        S3_PREFIX_REVALUATION,
        REVALUATION_IMAGE_FIELDS
      );
      const created = await this.createMyRevaluation.execute(studentId, body);
      res.status(201).json(created);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === OBJECT_STORAGE_EXCEPTION) {
        res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
        return;
      }
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === FORBIDDEN) {
        res.status(403).json({ message: error.message ?? 'Operação não permitida.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao criar reavaliação.' });
    }
  }
}
