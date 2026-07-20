import type { Request, Response } from 'express';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ListNoticesUseCase } from '../../../application/use-cases/notices/list-notices.use-case';
import type { GetNoticeUseCase } from '../../../application/use-cases/notices/get-notice.use-case';
import type { CreateNoticeUseCase } from '../../../application/use-cases/notices/create-notice.use-case';
import type { DeleteNoticeUseCase } from '../../../application/use-cases/notices/delete-notice.use-case';

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

export class NoticesController {
  constructor(
    private readonly listNotices: ListNoticesUseCase,
    private readonly getNotice: GetNoticeUseCase,
    private readonly createNotice: CreateNoticeUseCase,
    private readonly deleteNotice: DeleteNoticeUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listNotices.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.noticeId), 'noticeId');
      const row = await this.getNotice.execute(id);
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res);
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const trainerId = req.authUser!.sub;
      const created = await this.createNotice.execute(trainerId, req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.noticeId), 'noticeId');
      await this.deleteNotice.execute(id);
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === VALIDATION) {
        res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aviso não encontrado.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir aviso.' });
    }
  }

  private handleRead(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Aviso não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao consultar aviso.' });
  }

  private handleWrite(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao criar aviso.' });
  }
}
