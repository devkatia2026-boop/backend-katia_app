import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ListMethodsUseCase } from '../../../application/use-cases/methods/list-methods.use-case';
import type { GetMethodUseCase } from '../../../application/use-cases/methods/get-method.use-case';
import type { CreateMethodUseCase } from '../../../application/use-cases/trainer/create-method.use-case';
import type { UpdateMethodUseCase } from '../../../application/use-cases/trainer/update-method.use-case';
import type { DeleteMethodUseCase } from '../../../application/use-cases/trainer/delete-method.use-case';

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

export class MethodsController {
  constructor(
    private readonly listRows: ListMethodsUseCase,
    private readonly getRow: GetMethodUseCase,
    private readonly createRow: CreateMethodUseCase,
    private readonly updateRow: UpdateMethodUseCase,
    private readonly deleteRow: DeleteMethodUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.methodProgramId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar métodos.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.id), 'id');
      const row = await this.getRow.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter método.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRow.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar método.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.id), 'id');
      const updated = await this.updateRow.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar método.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.id), 'id');
      await this.deleteRow.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir método.');
    }
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
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
      res.status(400).json({ message: 'method_program_id não existe.' });
      return;
    }
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
