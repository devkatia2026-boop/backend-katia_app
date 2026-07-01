import type { Request, Response } from 'express';
import type { CreateMyAnamnesisUseCase } from '../../../application/use-cases/student/create-my-anamnesis.use-case';
import type { UpdateMyAnamnesisUseCase } from '../../../application/use-cases/student/update-my-anamnesis.use-case';
import type { GetMyAnamnesisUseCase } from '../../../application/use-cases/student/get-my-anamnesis.use-case';
import type { ListMyAnamnesisHistoryUseCase } from '../../../application/use-cases/student/list-my-anamnesis-history.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'AnamnesisNotFoundException';

export class StudentAnamnesisController {
  constructor(
    private readonly createMyAnamnesis: CreateMyAnamnesisUseCase,
    private readonly updateMyAnamnesis: UpdateMyAnamnesisUseCase,
    private readonly getMyAnamnesis: GetMyAnamnesisUseCase,
    private readonly listMyAnamnesisHistory: ListMyAnamnesisHistoryUseCase
  ) {}

  async get(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const row = await this.getMyAnamnesis.execute(studentId);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Anamnese não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter anamnese.' });
    }
  }

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
      res.status(500).json({ message: 'Erro ao criar anamnese.' });
    }
  }

  async listHistory(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const result = await this.listMyAnamnesisHistory.execute(
        studentId,
        req.query.page,
        req.query.pageSize
      );
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar histórico de anamnese.' });
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

