import type { Request, Response } from 'express';
import type { ListWellbeingUseCase } from '../../../application/use-cases/wellbeing/list-wellbeing.use-case';
import type { GetWellbeingUseCase } from '../../../application/use-cases/wellbeing/get-wellbeing.use-case';
import type { CreateWellbeingUseCase } from '../../../application/use-cases/wellbeing/create-wellbeing.use-case';
import type { UpdateWellbeingUseCase } from '../../../application/use-cases/wellbeing/update-wellbeing.use-case';
import type { DeleteWellbeingUseCase } from '../../../application/use-cases/wellbeing/delete-wellbeing.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  S3_PREFIX_WELLBEING,
  WELLBEING_IMAGE_FIELDS,
} from '../../../application/media/image-upload.config';
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

export class WellbeingController {
  constructor(
    private readonly listWellbeing: ListWellbeingUseCase,
    private readonly getWellbeing: GetWellbeingUseCase,
    private readonly createWellbeing: CreateWellbeingUseCase,
    private readonly updateWellbeing: UpdateWellbeingUseCase,
    private readonly deleteWellbeing: DeleteWellbeingUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listWellbeing.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellbeingId), 'wellbeingId');
      const row = await this.getWellbeing.execute(id, viewerRole(req));
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
        S3_PREFIX_WELLBEING,
        WELLBEING_IMAGE_FIELDS
      );
      const created = await this.createWellbeing.execute(body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellbeingId), 'wellbeingId');
      const trainerId = req.authUser!.sub;
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        trainerId,
        S3_PREFIX_WELLBEING,
        WELLBEING_IMAGE_FIELDS
      );
      const updated = await this.updateWellbeing.execute(id, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.wellbeingId), 'wellbeingId');
      await this.deleteWellbeing.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Wellbeing não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir wellbeing.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Wellbeing não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar wellbeing.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Wellbeing não encontrado.' });
      return;
    }
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar wellbeing.' });
  }
}
