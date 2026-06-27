import type { Request, Response } from 'express';
import type { ListProgramsUseCase } from '../../../application/use-cases/program/list-programs.use-case';
import type { GetProgramUseCase } from '../../../application/use-cases/program/get-program.use-case';
import type { CreateProgramUseCase } from '../../../application/use-cases/trainer/create-program.use-case';
import type { UpdateProgramUseCase } from '../../../application/use-cases/trainer/update-program.use-case';
import type { DeleteProgramUseCase } from '../../../application/use-cases/trainer/delete-program.use-case';

import type { ListTrainingsToProgramsUseCase } from '../../../application/use-cases/trainings-to-programs/list-trainings-to-programs.use-case';

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

function parseProgramId(raw: string | undefined, label = 'programId'): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${label} inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class ProgramsController {
  constructor(
    private readonly listPrograms: ListProgramsUseCase,
    private readonly getProgram: GetProgramUseCase,
    private readonly createProgram: CreateProgramUseCase,
    private readonly updateProgram: UpdateProgramUseCase,
    private readonly deleteProgram: DeleteProgramUseCase,
    private readonly listProgramTrainings: ListTrainingsToProgramsUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listPrograms.execute(firstQuery(req.query.page), firstQuery(req.query.pageSize));
      res.status(200).json(result);
    } catch {
      res.status(500).json({ message: 'Erro ao listar programas.' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseProgramId(firstParam(req.params.programId));
      const row = await this.getProgram.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async listTrainings(req: Request, res: Response): Promise<void> {
    try {
      const programId = parseProgramId(firstParam(req.params.programId));
      const result = await this.listProgramTrainings.executeByProgramId(
        programId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao listar treinos do programa.' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createProgram.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseProgramId(firstParam(req.params.programId));
      const updated = await this.updateProgram.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseProgramId(firstParam(req.params.programId));
      await this.deleteProgram.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Programa não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir programa.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Programa não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao obter programa.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Programa não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao salvar programa.' });
  }
}
