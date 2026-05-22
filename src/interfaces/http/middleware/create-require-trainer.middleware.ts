import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Exige que `req.authUser.sub` exista em `trainers` (use após `createRequireAuth`).
 */
export function createRequireTrainer(isTrainer: (cognitoSub: string) => Promise<boolean>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sub = req.authUser?.sub;
    if (!sub) {
      res.status(401).json({ message: 'Usuário não autenticado.', code: 'TOKEN_MISSING' });
      return;
    }
    if (!(await isTrainer(sub))) {
      res.status(403).json({ message: 'Acesso permitido apenas para treinadores.', code: 'FORBIDDEN_NOT_TRAINER' });
      return;
    }
    next();
  };
}
