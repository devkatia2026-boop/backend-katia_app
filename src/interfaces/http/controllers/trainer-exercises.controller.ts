import type { Request, Response } from 'express';
import type { ListExercisesUseCase } from '../../../application/use-cases/trainer/list-exercises.use-case';
import type { GetExerciseUseCase } from '../../../application/use-cases/trainer/get-exercise.use-case';
import type { CreateExerciseUseCase } from '../../../application/use-cases/trainer/create-exercise.use-case';
import type { UpdateExerciseUseCase } from '../../../application/use-cases/trainer/update-exercise.use-case';
import type { DeleteExerciseUseCase } from '../../../application/use-cases/trainer/delete-exercise.use-case';

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

function parseExerciseId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('exerciseId inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class TrainerExercisesController {
  constructor(
    private readonly listExercises: ListExercisesUseCase,
    private readonly getExercise: GetExerciseUseCase,
    private readonly createExercise: CreateExerciseUseCase,
    private readonly updateExercise: UpdateExerciseUseCase,
    private readonly deleteExercise: DeleteExerciseUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listExercises.execute(firstQuery(req.query.page), firstQuery(req.query.pageSize));
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar exercícios.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseExerciseId(firstParam(req.params.exerciseId));
      const row = await this.getExercise.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handle(err, res, 'Erro ao obter exercício.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createExercise.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handle(err, res, 'Erro ao criar exercício.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseExerciseId(firstParam(req.params.exerciseId));
      const updated = await this.updateExercise.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handle(err, res, 'Erro ao atualizar exercício.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseExerciseId(firstParam(req.params.exerciseId));
      await this.deleteExercise.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao excluir exercício.');
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

