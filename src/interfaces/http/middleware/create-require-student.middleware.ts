import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Exige que `req.authUser.sub` exista em `students` (use após `createRequireAuth`).
 */
export function createRequireStudent(isStudent: (cognitoSub: string) => Promise<boolean>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sub = req.authUser?.sub;
    if (!sub) {
      res.status(401).json({ message: 'Usuário não autenticado.', code: 'TOKEN_MISSING' });
      return;
    }
    if (!(await isStudent(sub))) {
      res.status(403).json({ message: 'Acesso permitido apenas para alunas.', code: 'FORBIDDEN_NOT_STUDENT' });
      return;
    }
    next();
  };
}

