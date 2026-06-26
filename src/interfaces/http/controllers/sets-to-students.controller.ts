import type { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import type { ListSetsToStudentsUseCase } from '../../../application/use-cases/sets-to-students/list-sets-to-students.use-case';
import type { GetSetToStudentUseCase } from '../../../application/use-cases/sets-to-students/get-set-to-student.use-case';
import type { CreateSetToStudentUseCase } from '../../../application/use-cases/trainer/create-set-to-student.use-case';
import type { UpdateSetToStudentUseCase } from '../../../application/use-cases/trainer/update-set-to-student.use-case';
import type { DeleteSetToStudentUseCase } from '../../../application/use-cases/trainer/delete-set-to-student.use-case';

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

function parseLinkId(raw: string | undefined): number {
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
  const sub = req.authUser!.sub;
  const role = req.authUser!.role!;
  return { role, sub };
}

export class SetsToStudentsController {
  constructor(
    private readonly listLinks: ListSetsToStudentsUseCase,
    private readonly getLink: GetSetToStudentUseCase,
    private readonly createLink: CreateSetToStudentUseCase,
    private readonly updateLink: UpdateSetToStudentUseCase,
    private readonly deleteLink: DeleteSetToStudentUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listLinks.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.studentId),
        firstQuery(req.query.setsId),
        authFrom(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar vínculos aluna↔set.');
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      const row = await this.getLink.execute(id, authFrom(req));
      res.status(200).json(row);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao obter vínculo aluna↔set.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createLink.execute(req.body, req.authUser!.sub);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao criar vínculo aluna↔set.');
    }
  }

  async patch(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      const updated = await this.updateLink.execute(id, req.body, req.authUser!.sub);
      res.status(200).json(updated);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao atualizar vínculo aluna↔set.');
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseLinkId(firstParam(req.params.id));
      await this.deleteLink.execute(id, req.authUser!.sub);
      res.status(204).end();
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao excluir vínculo aluna↔set.');
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
    if (err instanceof UniqueConstraintError) {
      res
        .status(409)
        .json({ message: 'Essa aluna já está vinculada a esse set.' });
      return;
    }
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'student_id ou sets_id não existe.' });
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
