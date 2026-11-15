import type { Request, Response } from 'express';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
import type { ListSubjectWellsUseCase } from '../../../application/use-cases/subject-wells/list-subject-wells.use-case';
import type { GetSubjectWellUseCase } from '../../../application/use-cases/subject-wells/get-subject-well.use-case';
import type { CreateSubjectWellUseCase } from '../../../application/use-cases/subject-wells/create-subject-well.use-case';
import type { UpdateSubjectWellUseCase } from '../../../application/use-cases/subject-wells/update-subject-well.use-case';
import type { DeleteSubjectWellUseCase } from '../../../application/use-cases/subject-wells/delete-subject-well.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  S3_PREFIX_SUBJECT_WELL,
  SUBJECT_WELL_UPLOAD_FIELDS,
} from '../../../application/media/image-upload.config';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function viewerRole(req: Request): ContentViewerRole {
  return req.authUser!.role as ContentViewerRole;
}

export class SubjectWellsController {
  constructor(
    private readonly listRows: ListSubjectWellsUseCase,
    private readonly getRow: GetSubjectWellUseCase,
    private readonly createRow: CreateSubjectWellUseCase,
    private readonly updateRow: UpdateSubjectWellUseCase,
    private readonly deleteRow: DeleteSubjectWellUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req),
        firstQuery(req.query.wellId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.subjectWellId), 'subjectWellId');
      const row = await this.getRow.execute(id, viewerRole(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_SUBJECT_WELL,
        SUBJECT_WELL_UPLOAD_FIELDS
      );
      const created = await this.createRow.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.subjectWellId), 'subjectWellId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_SUBJECT_WELL,
        SUBJECT_WELL_UPLOAD_FIELDS
      );
      const updated = await this.updateRow.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.subjectWellId), 'subjectWellId');
      await this.deleteRow.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Mídia do conteúdo não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir mídia do conteúdo.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Mídia do conteúdo não encontrada.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar mídia do conteúdo.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Recurso não encontrado.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar mídia do conteúdo.' });
  }
}