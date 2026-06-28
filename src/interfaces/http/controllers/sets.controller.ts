import type { Request, Response } from 'express';
import type { GetSetUseCase } from '../../../application/use-cases/trainer/get-set.use-case';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function parseSetId(raw: string | undefined): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error('setId inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export class SetsController {
  constructor(private readonly getSet: GetSetUseCase) {}

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseSetId(firstParam(req.params.setId));
      const row = await this.getSet.execute(id);
      res.status(200).json(row);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Set não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao obter set.' });
    }
  }
}
