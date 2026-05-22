import type { Request, Response } from 'express';
import type { CreateMyAnamnesisUseCase } from '../../../application/use-cases/student/create-my-anamnesis.use-case';
import type { UpdateMyAnamnesisUseCase } from '../../../application/use-cases/student/update-my-anamnesis.use-case';

const VALIDATION = 'ValidationException';
const ALREADY_EXISTS = 'AnamnesisAlreadyExistsException';
const NOT_FOUND = 'AnamnesisNotFoundException';

export class StudentAnamnesisController {
  constructor(
    private readonly createMyAnamnesis: CreateMyAnamnesisUseCase,
    private readonly updateMyAnamnesis: UpdateMyAnamnesisUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const created = await this.createMyAnamnesis.execute(studentId, req.body);
      res.status(201).json(created);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === ALREADY_EXISTS) {
        res.status(409).json({ message: error.message ?? 'Anamnese já existe.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao criar anamnese.' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const updated = await this.updateMyAnamnesis.execute(studentId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Anamnese não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar anamnese.' });
    }
  }
}

