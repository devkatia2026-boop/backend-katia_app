import type { Request, Response } from 'express';
import type { ListTrainingsUseCase } from '../../../application/use-cases/trainer/list-trainings.use-case';
import type { GetTrainingUseCase } from '../../../application/use-cases/trainer/get-training.use-case';
import type { CreateTrainingUseCase } from '../../../application/use-cases/trainer/create-training.use-case';
import type { UpdateTrainingUseCase } from '../../../application/use-cases/trainer/update-training.use-case';
import type { DeleteTrainingUseCase } from '../../../application/use-cases/trainer/delete-training.use-case';

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

export class TrainerTrainingsController {
  constructor(
    private readonly listTrainings: ListTrainingsUseCase,
    private readonly getTraining: GetTrainingUseCase,
    private readonly createTraining: CreateTrainingUseCase,
    private readonly updateTraining: UpdateTrainingUseCase,
    private readonly deleteTraining: DeleteTrainingUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listTrainings.execute(firstQuery(req.query.page), firstQuery(req.query.pageSize));
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar treinos.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseTrainingId(firstParam(req.params.trainingId));
      const row = await this.getTraining.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handle(err, res, 'Erro ao obter treino.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createTraining.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handle(err, res, 'Erro ao criar treino.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseTrainingId(firstParam(req.params.trainingId));
      const updated = await this.updateTraining.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handle(err, res, 'Erro ao atualizar treino.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseTrainingId(firstParam(req.params.trainingId));
      await this.deleteTraining.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao excluir treino.');
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
