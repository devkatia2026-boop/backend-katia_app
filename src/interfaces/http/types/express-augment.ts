/**
 * Carregado no entrypoint (main.ts) para que o ts-node aplique a extensão de Request em todo o projeto.
 * (Sem import de runtime: o módulo vem só de @types/express-serve-static-core.)
 */
declare module 'express-serve-static-core' {
  interface Request {
    /** Preenchido pelo middleware de autenticação após validar o Bearer token. */
    authUser?: { sub: string; accessToken: string; role?: 'student' | 'trainer' };
  }
}

export {};
