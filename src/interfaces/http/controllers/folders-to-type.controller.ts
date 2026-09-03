import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import type { ListFoldersToTypeUseCase } from '../../../application/use-cases/folders-to-type/list-folders-to-type.use-case';
import type { GetFolderToTypeUseCase } from '../../../application/use-cases/folders-to-type/get-folder-to-type.use-case';
import type { CreateFolderToTypeUseCase } from '../../../application/use-cases/trainer/create-folder-to-type.use-case';
import type { UpdateFolderToTypeUseCase } from '../../../application/use-cases/trainer/update-folder-to-type.use-case';
import type { DeleteFolderToTypeUseCase } from '../../../application/use-cases/trainer/delete-folder-to-type.use-case';

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

function parseId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('id inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class FoldersToTypeController {
  constructor(
    private readonly listRows: ListFoldersToTypeUseCase,
    private readonly getRow: GetFolderToTypeUseCase,
    private readonly createRow: CreateFolderToTypeUseCase,
    private readonly updateRow: UpdateFolderToTypeUseCase,
    private readonly deleteRow: DeleteFolderToTypeUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.folderId),
        firstQuery(req.query.type),
        firstQuery(req.query.trainingId),
        firstQuery(req.query.exerciseId),
        firstQuery(req.query.setId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar vínculos pasta↔conteúdo.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      const row = await this.getRow.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter vínculo pasta↔conteúdo.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRow.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar vínculo pasta↔conteúdo.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      const updated = await this.updateRow.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar vínculo pasta↔conteúdo.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      await this.deleteRow.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir vínculo pasta↔conteúdo.');
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
      res.status(400).json({
        message: 'folder_id, training_id, exercise_id ou set_id não existe.',
      });
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
    res.status(500).json({ message: fallback });
  }
}
