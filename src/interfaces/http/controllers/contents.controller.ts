import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
import type { ListContentsUseCase } from '../../../application/use-cases/contents/list-contents.use-case';
import type { GetContentUseCase } from '../../../application/use-cases/contents/get-content.use-case';
import type { CreateContentUseCase } from '../../../application/use-cases/contents/create-content.use-case';
import type { UpdateContentUseCase } from '../../../application/use-cases/contents/update-content.use-case';
import type { DeleteContentUseCase } from '../../../application/use-cases/contents/delete-content.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  INTRODUCTION_CONTENT_UPLOAD_FIELDS,
  S3_PREFIX_INTRODUCTION_CONTENT,
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

export class ContentsController {
  constructor(
    private readonly listRows: ListContentsUseCase,
    private readonly getRow: GetContentUseCase,
    private readonly createRow: CreateContentUseCase,
    private readonly updateRow: UpdateContentUseCase,
    private readonly deleteRow: DeleteContentUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req),
        firstQuery(req.query.introductionId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar conteúdos.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.contentId), 'contentId');
      const row = await this.getRow.execute(id, viewerRole(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter conteúdo.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_INTRODUCTION_CONTENT,
        INTRODUCTION_CONTENT_UPLOAD_FIELDS
      );
      const created = await this.createRow.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar conteúdo.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.contentId), 'contentId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_INTRODUCTION_CONTENT,
        INTRODUCTION_CONTENT_UPLOAD_FIELDS
      );
      const updated = await this.updateRow.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar conteúdo.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.contentId), 'contentId');
      await this.deleteRow.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir conteúdo.');
    }
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }

  private handleWrite(err: unknown, res: Response, fallback: string): void {
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'introduction_id não existe.' });
      return;
    }
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
