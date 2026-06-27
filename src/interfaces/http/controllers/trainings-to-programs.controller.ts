import type { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import type { ListTrainingsToProgramsUseCase } from '../../../application/use-cases/trainings-to-programs/list-trainings-to-programs.use-case';
import type { CreateTrainingToProgramUseCase } from '../../../application/use-cases/trainer/create-training-to-program.use-case';

const VALIDATION = 'ValidationException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

export class TrainingsToProgramsController {
  constructor(
    private readonly listLinks: ListTrainingsToProgramsUseCase,
    private readonly createLink: CreateTrainingToProgramUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listLinks.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.programId),
        firstQuery(req.query.trainingId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar vínculos treino↔programa.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createLink.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar vínculo treino↔programa.');
    }
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }

  private handleWrite(err: unknown, res: Response, fallback: string): void {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: 'Esse treino já está vinculado a esse programa.' });
      return;
    }
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'program_id ou training_id não existe.' });
      return;
    }
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
