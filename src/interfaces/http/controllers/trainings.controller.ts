import type { Request, Response } from 'express';
import type { GetTrainingUseCase } from '../../../application/use-cases/trainer/get-training.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseTrainingId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('trainingId inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class TrainingsController {
  constructor(private readonly getTraining: GetTrainingUseCase) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseTrainingId(firstParam(req.params.trainingId));
      const row = await this.getTraining.execute(id);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Treino não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter treino.' });
    }
  }
}
