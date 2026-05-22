import type { Request, Response } from 'express';
import type { ListMyPhysicalsUseCase } from '../../../application/use-cases/student/list-my-physicals.use-case';
import type { GetMyPhysicalUseCase } from '../../../application/use-cases/student/get-my-physical.use-case';
import type { CreateMyPhysicalUseCase } from '../../../application/use-cases/student/create-my-physical.use-case';
import type { UpdateMyPhysicalUseCase } from '../../../application/use-cases/student/update-my-physical.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'PhysicalNotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parsePhysicalId(raw: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('Identificador do registro físico inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class StudentPhysicalsController {
  constructor(
    private readonly listMyPhysicals: ListMyPhysicalsUseCase,
    private readonly getMyPhysical: GetMyPhysicalUseCase,
    private readonly createMyPhysical: CreateMyPhysicalUseCase,
    private readonly updateMyPhysical: UpdateMyPhysicalUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const items = await this.listMyPhysicals.execute(studentId);
      res.status(200).json({ items });
    } catch {
      res.status(500).json({ message: 'Erro ao listar registros físicos.' });
    }
  }

  async getOne(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const physicalId = parsePhysicalId(firstParam(req.params.physicalId));
      const row = await this.getMyPhysical.execute(studentId, physicalId);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Registro não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter registro físico.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const created = await this.createMyPhysical.execute(studentId, req.body);
      res.status(201).json(created);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao criar registro físico.' });
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const studentId = req.authUser!.sub;
      const physicalId = parsePhysicalId(firstParam(req.params.physicalId));
      const updated = await this.updateMyPhysical.execute(studentId, physicalId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Registro não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao atualizar registro físico.' });
    }
  }
}
