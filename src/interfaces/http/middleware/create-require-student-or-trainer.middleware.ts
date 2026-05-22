import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { AuthorRole } from '../../../application/ports/social-feed.port';

/**
 * Exige perfil `student` ou `trainer` no banco local e define `req.authUser.role`.
 * Use após `createRequireAuth`.
 */
export function createRequireStudentOrTrainer(
  resolveRole: (cognitoSub: string) => Promise<AuthorRole | null>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sub = req.authUser?.sub;
    const accessToken = req.authUser?.accessToken;
    if (!sub || !accessToken) {
      res.status(401).json({ message: 'Usuário não autenticado.', code: 'TOKEN_MISSING' });
      return;
    }
    const role = await resolveRole(sub);
    if (!role) {
      res.status(403).json({
        message: 'Acesso restrito a alunas ou treinadores cadastrados.',
        code: 'FORBIDDEN_NOT_STUDENT_OR_TRAINER',
      });
      return;
    }
    req.authUser = { sub, accessToken, role };
    next();
  };
}
