import type { Request, Response } from 'express';
import type { ListWellsUseCase } from '../../../application/use-cases/wells/list-wells.use-case';
import type { GetWellUseCase } from '../../../application/use-cases/wells/get-well.use-case';
import type { CreateWellUseCase } from '../../../application/use-cases/wells/create-well.use-case';
import type { UpdateWellUseCase } from '../../../application/use-cases/wells/update-well.use-case';
import type { DeleteWellUseCase } from '../../../application/use-cases/wells/delete-well.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import { S3_PREFIX_WELL, WELL_IMAGE_FIELDS } from '../../../application/media/image-upload.config';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
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

export class WellsController {
  constructor(
    private readonly listWells: ListWellsUseCase,
    private readonly getWell: GetWellUseCase,
    private readonly createWell: CreateWellUseCase,
    private readonly updateWell: UpdateWellUseCase,
    private readonly deleteWell: DeleteWellUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listWells.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req),
        firstQuery(req.query.wellbeingId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellId), 'wellId');
      const row = await this.getWell.execute(id, viewerRole(req));
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
        S3_PREFIX_WELL,
        WELL_IMAGE_FIELDS
      );
      const created = await this.createWell.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellId), 'wellId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_WELL,
        WELL_IMAGE_FIELDS
      );
      const updated = await this.updateWell.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellId), 'wellId');
      await this.deleteWell.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Well não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir well.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Well não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar well.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Well não encontrado.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar well.' });
  }
}
