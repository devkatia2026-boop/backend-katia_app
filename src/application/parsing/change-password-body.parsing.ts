const VALIDATION = 'ValidationException';

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export function parseChangePasswordBody(body: unknown): ChangePasswordInput {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const record = body as Record<string, unknown>;
  const currentPassword =
    typeof record.currentPassword === 'string' ? record.currentPassword : '';
  const newPassword = typeof record.newPassword === 'string' ? record.newPassword : '';

  if (currentPassword.trim().length === 0) {
    const err = new Error('Campo "currentPassword" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }

  if (newPassword.trim().length === 0) {
    const err = new Error('Campo "newPassword" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }

  return {
    currentPassword,
    newPassword,
  };
}
