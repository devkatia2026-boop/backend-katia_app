import type { Request, Response } from 'express';
import type { ListConversationMessagesUseCase } from '../../../application/use-cases/conversations/list-conversation-messages.use-case';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'NotFoundException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function authFrom(req: Request): { role: 'student' | 'trainer'; sub: string } {
  return { role: req.authUser!.role!, sub: req.authUser!.sub };
}

export class ConversationsController {
  constructor(private readonly listMsgs: ListConversationMessagesUseCase) {}

  async listMessages(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listMsgs.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.studentId),
        authFrom(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar mensagens da conversa.');
    }
  }

  private handle(err: unknown, res: Response, fallback: string): void {
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
}
