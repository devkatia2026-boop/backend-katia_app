import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Middleware que exige `Authorization: Bearer <access token do Cognito>`.
 * O verificador é injetado (port) para manter a camada HTTP sem acoplar à AWS.
 */
export function createRequireAuth(
  verifyAccessToken: (token: string) => Promise<{ sub: string }>
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      res.status(401).json({
        message: 'Autenticação necessária. Envie o header Authorization: Bearer <access_token>.',
        code: 'TOKEN_MISSING',
      });
      return;
    }

    const raw = header.slice(7).trim();
    if (!raw) {
      res.status(401).json({ message: 'Token ausente.', code: 'TOKEN_MISSING' });
      return;
    }

    try {
      const { sub } = await verifyAccessToken(raw);
      req.authUser = { sub, accessToken: raw };
      next();
    } catch {
      res.status(401).json({ message: 'Token inválido ou expirado.', code: 'TOKEN_INVALID' });
    }
  };
}
