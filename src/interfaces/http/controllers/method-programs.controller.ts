import type { Request, Response } from 'express';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { GetMethodProgramUseCase } from '../../../application/use-cases/method-programs/get-method-program.use-case';
import type { UpdateMethodProgramUseCase } from '../../../application/use-cases/trainer/update-method-program.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export class MethodProgramsController {
  constructor(
    private readonly getRow: GetMethodProgramUseCase,
    private readonly updateRow: UpdateMethodProgramUseCase
  ) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.id), 'id');
      const row = await this.getRow.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter métodos do programa.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.id), 'id');
      const updated = await this.updateRow.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar métodos do programa.');
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
