import type { Request, Response } from 'express';
import { ForeignKeyConstraintError } from 'sequelize';
import { parseResourceId } from '../../../application/parsing/content-body.parsing';
import type { ContentViewerRole } from '../../../application/parsing/content-viewer.parsing';
import type { ListIntroductionsUseCase } from '../../../application/use-cases/introductions/list-introductions.use-case';
import type { GetIntroductionUseCase } from '../../../application/use-cases/introductions/get-introduction.use-case';
import type { CreateIntroductionUseCase } from '../../../application/use-cases/introductions/create-introduction.use-case';
import type { UpdateIntroductionUseCase } from '../../../application/use-cases/introductions/update-introduction.use-case';
import type { DeleteIntroductionUseCase } from '../../../application/use-cases/introductions/delete-introduction.use-case';

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

function viewerRole(req: Request): ContentViewerRole {
  return req.authUser!.role as ContentViewerRole;
}

export class IntroductionsController {
  constructor(
    private readonly listRows: ListIntroductionsUseCase,
    private readonly getRow: GetIntroductionUseCase,
    private readonly createRow: CreateIntroductionUseCase,
    private readonly updateRow: UpdateIntroductionUseCase,
    private readonly deleteRow: DeleteIntroductionUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listRows.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        viewerRole(req),
        firstQuery(req.query.programId)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar introduções.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.introductionId), 'introductionId');
      const row = await this.getRow.execute(id, viewerRole(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter introdução.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createRow.execute(req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar introdução.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.introductionId), 'introductionId');
      const updated = await this.updateRow.execute(id, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar introdução.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseResourceId(firstParam(req.params.introductionId), 'introductionId');
      await this.deleteRow.execute(id);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir introdução.');
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
      res.status(400).json({ message: 'program_id não existe.' });
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
