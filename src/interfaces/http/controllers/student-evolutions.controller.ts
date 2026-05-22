import type { Request, Response } from 'express';
import type { ListMyEvolutionsUseCase } from '../../../application/use-cases/student/list-my-evolutions.use-case';
import type { GetMyEvolutionUseCase } from '../../../application/use-cases/student/get-my-evolution.use-case';
import type { CreateMyEvolutionUseCase } from '../../../application/use-cases/student/create-my-evolution.use-case';
import type { UpdateMyEvolutionUseCase } from '../../../application/use-cases/student/update-my-evolution.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'EvolutionNotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseEvolutionId(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('Identificador da evolução inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class StudentEvolutionsController {
  constructor(
    private readonly listMyEvolutions: ListMyEvolutionsUseCase,
    private readonly getMyEvolution: GetMyEvolutionUseCase,
    private readonly createMyEvolution: CreateMyEvolutionUseCase,
    private readonly updateMyEvolution: UpdateMyEvolutionUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const items = await this.listMyEvolutions.execute(studentId);
      res.status(200).json({ items });
    } catch {
      res.status(500).json({ message: 'Erro ao listar evoluções.' });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const evolutionId = parseEvolutionId(firstParam(req.params.evolutionId));
      const row = await this.getMyEvolution.execute(studentId, evolutionId);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Evolução não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter evolução.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const created = await this.createMyEvolution.execute(studentId, req.body);
      res.status(201).json(created);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao criar evolução.' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const evolutionId = parseEvolutionId(firstParam(req.params.evolutionId));
      const updated = await this.updateMyEvolution.execute(studentId, evolutionId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Evolução não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar evolução.' });
    }
  }
}
