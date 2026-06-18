import type { Request, Response } from 'express';
import { formatAnamnesisExclusiveResponse } from '../../../application/anamnesis-exclusive/anamnesis-exclusive-response.formatter';
import type { CreateMyAnamnesisExclusiveUseCase } from '../../../application/use-cases/anamnesis-exclusive/create-my-anamnesis-exclusive.use-case';
import type { GetAnamnesisExclusiveByStudentIdUseCase } from '../../../application/use-cases/anamnesis-exclusive/get-anamnesis-exclusive-by-id.use-case';
import type { GetAnamnesisExclusiveCompletionUseCase } from '../../../application/use-cases/anamnesis-exclusive/get-anamnesis-exclusive-completion.use-case';
import {
  ObjectStorageException,
  type UploadAnamnesisExclusiveFilesUseCase,
} from '../../../application/use-cases/anamnesis-exclusive/upload-anamnesis-exclusive-files.use-case';
import {
  extractAnamnesisExclusiveUploadedFiles,
  hasUploadedAnamnesisExclusiveFiles,
} from '../parsing/anamnesis-exclusive-multipart.parsing';

const VALIDATION = 'ValidationException';
const ALREADY_EXISTS = 'AnamnesisExclusiveAlreadyExistsException';
const NOT_FOUND = 'AnamnesisExclusiveNotFoundException';
const FORBIDDEN = 'ForbiddenException';
const STUDENT_NOT_FOUND = 'StudentNotFoundException';

function authFrom(req: Request): { role: 'student' | 'trainer'; sub: string } {
  return { role: req.authUser!.role!, sub: req.authUser!.sub };
}

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function isMultipartRequest(req: Request): boolean {
  const contentType = req.headers['content-type'] ?? '';
  return contentType.toLowerCase().includes('multipart/form-data');
}

export class AnamnesisExclusiveController {
  constructor(
    private readonly createMy: CreateMyAnamnesisExclusiveUseCase,
    private readonly uploadFiles: UploadAnamnesisExclusiveFilesUseCase,
    private readonly getByStudentId: GetAnamnesisExclusiveByStudentIdUseCase,
    private readonly getCompletionStatus: GetAnamnesisExclusiveCompletionUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      let uploadedValues;
      if (isMultipartRequest(req)) {
        if (hasUploadedAnamnesisExclusiveFiles(req)) {
          uploadedValues = await this.uploadFiles.execute(
            studentId,
            extractAnamnesisExclusiveUploadedFiles(req)
          );
        }
      }
      const created = await this.createMy.execute(studentId, req.body, uploadedValues);
      res.status(201).json(formatAnamnesisExclusiveResponse(created));
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const row = await this.getByStudentId.execute(authFrom(req), req.params.studentId);
      res.status(200).json(formatAnamnesisExclusiveResponse(row));
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter anamnese exclusive.');
    }
  }

  async getCompletion(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.getCompletionStatus.execute(authFrom(req), firstParam(req.params.studentId));
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao verificar preenchimento da anamnese exclusive.');
    }
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === ALREADY_EXISTS) {
      res.status(409).json({ message: error.message ?? 'Anamnese exclusive já existe.' });
      return;
    }
    if (error.name === ObjectStorageException) {
      res.status(503).json({ message: error.message ?? 'Armazenamento de arquivos indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao criar anamnese exclusive.' });
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === FORBIDDEN) {
      res.status(403).json({ message: error.message ?? 'Proibido.' });
      return;
    }
    if (error.name === STUDENT_NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Anamnese exclusive não encontrada.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
