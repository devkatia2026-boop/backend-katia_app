import type { Request, Response } from 'express';
import type { GetStudentWasExclusiveUseCase } from '../../../application/use-cases/students/get-student-was-exclusive.use-case';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'StudentNotFoundException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export class StudentSharedController {
  constructor(private readonly getStudentWasExclusive: GetStudentWasExclusiveUseCase) {}

  async getWasExclusive(req: Request, res: Response): Promise<void> {
    try {
      const viewerId = req.authUser!.sub;
      const viewerRole = req.authUser!.role as 'student' | 'trainer';
      const studentId = firstParam(req.params.studentId);
      const result = await this.getStudentWasExclusive.execute(viewerId, viewerRole, studentId);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === FORBIDDEN) {
        res.status(403).json({ message: error.message ?? 'Acesso negado.' });
        return;
      }
      if (error.name === NOT_FOUND) {
        res.status(404).json({ message: error.message ?? 'Aluna não encontrada.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao consultar histórico de plano exclusivo.' });
    }
  }
}
