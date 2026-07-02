import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import type { ListFeedbacksUseCase } from '../../../application/use-cases/feedbacks/list-feedbacks.use-case';
import type { GetFeedbackUseCase } from '../../../application/use-cases/feedbacks/get-feedback.use-case';
import type { CreateFeedbackUseCase } from '../../../application/use-cases/feedbacks/create-feedback.use-case';
import type { CreateFeedbackResponseUseCase } from '../../../application/use-cases/feedbacks/create-feedback-response.use-case';
import type {
  DeleteFeedbackResponseUseCase,
  ListFeedbackResponsesUseCase,
  UpdateFeedbackResponseUseCase,
} from '../../../application/use-cases/feedbacks/feedback-response.use-cases';

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

function parseId(raw: string | undefined, label = 'id'): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${label} inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

function authFrom(req: Request): { role: 'student' | 'trainer'; sub: string } {
  return { role: req.authUser!.role!, sub: req.authUser!.sub };
}

export class FeedbacksController {
  constructor(
    private readonly listRows: ListFeedbacksUseCase,
    private readonly getRow: GetFeedbackUseCase,
    private readonly createRow: CreateFeedbackUseCase,
    private readonly listFeedbackResponses: ListFeedbackResponsesUseCase,
    private readonly createFeedbackResponse: CreateFeedbackResponseUseCase,
    private readonly updateFeedbackResponse: UpdateFeedbackResponseUseCase,
    private readonly deleteFeedbackResponse: DeleteFeedbackResponseUseCase
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
      this.handleRead(err, res, 'Erro ao listar feedbacks.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseId(firstParam(req.params.id));
      const row = await this.getRow.execute(id, authFrom(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter feedback.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRow.execute(req.body, req.authUser!.sub);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar feedback.');
    }
  }

  async listResponsesByFeedback(req: Request, res: Response): Promise<void> {
    try {
      const feedbackId = parseId(firstParam(req.params.feedbackId), 'feedbackId');
      const rows = await this.listFeedbackResponses.execute(feedbackId, authFrom(req));
      res.status(200).json({ feedback_id: feedbackId, items: rows });
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar respostas do feedback.');
    }
  }

  async createResponse(req: Request, res: Response): Promise<void> {
    try {
      const feedbackId = parseId(firstParam(req.params.feedbackId), 'feedbackId');
      const created = await this.createFeedbackResponse.execute(feedbackId, req.body, authFrom(req));
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao responder feedback.');
    }
  }

  async updateResponse(req: Request, res: Response): Promise<void> {
    try {
      const feedbackId = parseId(firstParam(req.params.feedbackId), 'feedbackId');
      const responseId = parseId(firstParam(req.params.responseId), 'responseId');
      const updated = await this.updateFeedbackResponse.execute(
        feedbackId,
        responseId,
        req.body,
        authFrom(req)
      );
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao editar resposta.');
    }
  }

  async deleteResponse(req: Request, res: Response): Promise<void> {
    try {
      const feedbackId = parseId(firstParam(req.params.feedbackId), 'feedbackId');
      const responseId = parseId(firstParam(req.params.responseId), 'responseId');
      await this.deleteFeedbackResponse.execute(feedbackId, responseId, authFrom(req));
      res.status(204).end();
    } catch (err) {
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
        res.status(404).json({ message: error.message ?? 'Resposta não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir resposta.' });
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
      res.status(400).json({ message: 'Aluna inválida ou não encontrada.' });
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
