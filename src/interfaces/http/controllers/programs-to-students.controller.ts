import type { Request, Response } from 'express';
import { ForeignKeyConstraintError, UniqueConstraintError } from 'sequelize';
import type { ListProgramsToStudentsUseCase } from '../../../application/use-cases/programs-to-students/list-programs-to-students.use-case';
import type { CreateProgramToStudentUseCase } from '../../../application/use-cases/student/create-program-to-student.use-case';
import type { LeaveProgramToStudentUseCase } from '../../../application/use-cases/student/leave-program-to-student.use-case';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'NotFoundException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function authFrom(req: Request): { role: 'student' | 'trainer'; sub: string } {
  const sub = req.authUser!.sub;
  const role = req.authUser!.role!;
  return { role, sub };
}

export class ProgramsToStudentsController {
  constructor(
    private readonly listLinks: ListProgramsToStudentsUseCase,
    private readonly createLink: CreateProgramToStudentUseCase,
    private readonly leaveLink: LeaveProgramToStudentUseCase
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.listLinks.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        firstQuery(req.query.studentId),
        firstQuery(req.query.programId),
        firstQuery(req.query.search),
        authFrom(req)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handleRead(err, res, 'Erro ao listar vínculos aluna↔programa.');
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.createLink.execute(req.body, req.authUser!.sub);
      res.status(201).json(created);
    } catch (err) {
      this.handleWrite(err, res, 'Erro ao entrar no programa.');
    }
  }

  async leave(req: Request, res: Response): Promise<void> {
    try {
      await this.leaveLink.execute(firstQuery(req.query.programId), req.authUser!.sub);
      res.status(204).end();
    } catch (err) {
      this.handleLeave(err, res);
    }
  }

  private handleLeave(err: unknown, res: Response): void {
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Parâmetro inválido.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Vínculo não encontrado.' });
      return;
    }
    res.status(500).json({ message: 'Erro ao sair do programa.' });
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
    res.status(500).json({ message: fallback });
  }

  private handleWrite(err: unknown, res: Response, fallback: string): void {
    if (err instanceof UniqueConstraintError) {
      res.status(409).json({ message: 'Você já faz parte deste programa.' });
      return;
    }
    if (err instanceof ForeignKeyConstraintError) {
      res.status(400).json({ message: 'program_id não existe.' });
      return;
    }
    const error = err as { name?: string; message?: string };
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
