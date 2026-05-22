import type { Request, Response } from 'express';
import type { ListSetsUseCase } from '../../../application/use-cases/trainer/list-sets.use-case';
import type { GetSetUseCase } from '../../../application/use-cases/trainer/get-set.use-case';
import type { CreateSetUseCase } from '../../../application/use-cases/trainer/create-set.use-case';
import type { UpdateSetUseCase } from '../../../application/use-cases/trainer/update-set.use-case';
import type { DeleteSetUseCase } from '../../../application/use-cases/trainer/delete-set.use-case';

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

function parseSetId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('setId inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class TrainerSetsController {
  constructor(
    private readonly listSets: ListSetsUseCase,
    private readonly getSet: GetSetUseCase,
    private readonly createSet: CreateSetUseCase,
    private readonly updateSet: UpdateSetUseCase,
    private readonly deleteSet: DeleteSetUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listSets.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar sets.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseSetId(firstParam(req.params.setId));
      const row = await this.getSet.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handle(err, res, 'Erro ao obter set.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createSet.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handle(err, res, 'Erro ao criar set.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseSetId(firstParam(req.params.setId));
      const updated = await this.updateSet.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handle(err, res, 'Erro ao atualizar set.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseSetId(firstParam(req.params.setId));
      await this.deleteSet.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao excluir set.');
    }
  }

  private handle(err: unknown, res: Response, fallback: string): void {
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
