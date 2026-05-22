import type { Request, Response } from 'express';
import type { GetExerciseUseCase } from '../../../application/use-cases/trainer/get-exercise.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
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

export class ExercisesController {
  constructor(private readonly getExercise: GetExerciseUseCase) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseExerciseId(firstParam(req.params.exerciseId));
      const row = await this.getExercise.execute(id);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Exercício não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter exercício.' });
    }
  }
}
