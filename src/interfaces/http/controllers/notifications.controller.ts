import type { Request, Response } from 'express';
import type { ListNotificationsUseCase } from '../../../application/use-cases/notifications/list-notifications.use-case';
import type { GetNotificationUseCase } from '../../../application/use-cases/notifications/get-notification.use-case';

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

export class NotificationsController {
  constructor(
    private readonly listRows: ListNotificationsUseCase,
    private readonly getRow: GetNotificationUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        authFrom(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar notificações.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      const row = await this.getRow.execute(id, authFrom(req));
      res.status(200).json(row);
    } catch (err) {
      this.handle(err, res, 'Erro ao obter notificação.');
    }
  }

  private handle(err: unknown, res: Response, fallback: string): void {
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
}
