import type { Request, Response } from 'express';
import type { DeleteStudentAccountUseCase } from '../../../application/use-cases/student/delete-student-account.use-case';

const FORBIDDEN = 'ForbiddenException';

export class StudentAccountController {
  constructor(private readonly deleteAccount: DeleteStudentAccountUseCase) {}

  async deleteMe(req: Request, res: Response): Promise<void> {
    try {
      const sub = req.authUser?.sub;
      const role = req.authUser?.role;

      if (!sub || !role) {
        res.status(401).json({ message: 'Usuário não autenticado.' });
        return;
      }

      await this.deleteAccount.execute({ role, sub });
      res.status(204).end();
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === FORBIDDEN) {
        res.status(403).json({ message: error.message ?? 'Proibido.' });
        return;
      }
      res.status(500).json({ message: 'Erro ao excluir conta.' });
    }
  }
}
