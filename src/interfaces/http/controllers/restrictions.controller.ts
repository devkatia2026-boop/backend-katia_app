import type { Request, Response } from 'express';
import type { AuthorRole } from '../../../application/ports/social-feed.port';
import type { RestrictionActor } from '../../../application/ports/restrictions.port';
import type { CreateRestrictionUseCase } from '../../../application/use-cases/restrictions/create-restriction.use-case';
import type { ListRestrictionsUseCase } from '../../../application/use-cases/restrictions/list-restrictions.use-case';
import type { DeleteRestrictionUseCase } from '../../../application/use-cases/restrictions/delete-restriction.use-case';
import type { ClearRestrictionsUseCase } from '../../../application/use-cases/restrictions/clear-restrictions.use-case';
import type { CreateSocialReportUseCase } from '../../../application/use-cases/social/create-social-report.use-case';
import { TRANSACTIONAL_EMAIL_EXCEPTION } from '../../../infrastructure/email/ses-transactional-email.adapter';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function actor(req: Request): RestrictionActor {
  return { id: req.authUser!.sub, type: req.authUser!.role as AuthorRole };
}

function parseRestrictionId(raw: string | undefined): string {
  const v = raw?.trim() ?? '';
  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRe.test(v)) {
    const err = new Error('restrictionId inválido.');
    err.name = VALIDATION;
    throw err;
  }
  return v.toLowerCase();
}

export class RestrictionsController {
  constructor(
    private readonly createRestriction: CreateRestrictionUseCase,
    private readonly listRestrictions: ListRestrictionsUseCase,
    private readonly deleteRestriction: DeleteRestrictionUseCase,
    private readonly clearRestrictions: ClearRestrictionsUseCase,
    private readonly createSocialReport: CreateSocialReportUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRestriction.execute(req.body, actor(req));
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar bloqueio.');
    }
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.listRestrictions.execute(actor(req));
      res.status(200).json({ items, total: items.length });
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar bloqueios.');
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const id = parseRestrictionId(firstParam(req.params.restrictionId));
      await this.deleteRestriction.execute(id, actor(req));
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao remover bloqueio.');
    }
  }

  async clearAll(req: Request, res: Response): Promise<void> {
    try {
      const removed = await this.clearRestrictions.execute(actor(req));
      res.status(200).json({ removed });
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao remover bloqueios.');
    }
  }

  async report(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.createSocialReport.execute(req.body, req.authUser!.sub);
      res.status(202).json(result);
    } catch (err) {
      this.handleReport(err, res);
    }
  }

  private handleRead(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
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

  private handleReport(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    if (error.name === FORBIDDEN) {
      res.status(403).json({ message: error.message ?? 'Operação não permitida.' });
      return;
    }
    if (error.name === TRANSACTIONAL_EMAIL_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Falha ao enviar e-mail.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao registrar denúncia.' });
  }
}
