const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    const err = new Error(`Campo "${field}" deve ser uma string não vazia.`);
    err.name = VALIDATION;
    throw err;
  }
  return value.trim();
}

export function parseAppVersionCreateBody(body: unknown): { version: string } {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('version' in body)) {
    const err = new Error('Campo "version" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  return { version: expectNonEmptyString(body.version, 'version') };
}

export function parseAppVersionPatchBody(body: unknown): { version: string } {
  return parseAppVersionCreateBody(body);
}
