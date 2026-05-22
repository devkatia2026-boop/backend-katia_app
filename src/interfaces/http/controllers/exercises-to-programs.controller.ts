import type { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import type { ListExercisesToProgramsUseCase } from '../../../application/use-cases/exercises-to-programs/list-exercises-to-programs.use-case';
import type { GetExerciseToProgramUseCase } from '../../../application/use-cases/exercises-to-programs/get-exercise-to-program.use-case';
import type { CreateExerciseToProgramUseCase } from '../../../application/use-cases/trainer/create-exercise-to-program.use-case';
import type { UpdateExerciseToProgramUseCase } from '../../../application/use-cases/trainer/update-exercise-to-program.use-case';
import type { DeleteExerciseToProgramUseCase } from '../../../application/use-cases/trainer/delete-exercise-to-program.use-case';

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

function parseLinkId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('id inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class ExercisesToProgramsController {
  constructor(
    private readonly listLinks: ListExercisesToProgramsUseCase,
    private readonly getLink: GetExerciseToProgramUseCase,
    private readonly createLink: CreateExerciseToProgramUseCase,
    private readonly updateLink: UpdateExerciseToProgramUseCase,
    private readonly deleteLink: DeleteExerciseToProgramUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listLinks.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.programId),
        firstQuery(req.query.exerciseId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar vínculos exercício↔programa.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      const row = await this.getLink.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter vínculo exercício↔programa.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createLink.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar vínculo exercício↔programa.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      const updated = await this.updateLink.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar vínculo exercício↔programa.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      await this.deleteLink.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir vínculo exercício↔programa.');
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
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: 'Esse exercício já está vinculado a esse programa.' });
      return;
    }
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'program_id ou exercise_id não existe.' });
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
