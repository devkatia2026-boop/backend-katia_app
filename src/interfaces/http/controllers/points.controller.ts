import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import type { ListPointsUseCase } from '../../../application/use-cases/points/list-points.use-case';
import type { GetPointUseCase } from '../../../application/use-cases/points/get-point.use-case';
import type { CreatePointUseCase } from '../../../application/use-cases/points/create-point.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('id inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

function authFrom(req: Request): { role: 'student' | 'trainer'; sub: string } {
  return { role: req.authUser!.role!, sub: req.authUser!.sub };
}

export class PointsController {
  constructor(
    private readonly listRows: ListPointsUseCase,
    private readonly getRow: GetPointUseCase,
    private readonly createRow: CreatePointUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.studentId),
        authFrom(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar registros de treino.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      const row = await this.getRow.execute(id, authFrom(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter registro de treino.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRow.execute(req.body, req.authUser!.sub);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar registro de treino.');
    }
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === FORBIDDEN) {
      res.status(403).json({ message: error.message ?? 'Proibido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }

  private handleWrite(err: unknown, res: Response, fallback: string): void {
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'Dados inválidos (aluna não encontrada).' });
      return;
    }
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === FORBIDDEN) {
      res.status(403).json({ message: error.message ?? 'Proibido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
