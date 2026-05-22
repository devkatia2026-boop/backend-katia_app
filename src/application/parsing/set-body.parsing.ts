import type { CreateSetInput, PatchSetInput } from '../ports/sets.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableTrimmed(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

/** Criação: ao menos `name` ou `order` deve ter texto após trim. */
export function parseSetCreateBody(body: unknown): CreateSetInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const name = 'name' in body ? expectNullableTrimmed(body.name ?? null, 'name') : null;
  const order = 'order' in body ? expectNullableTrimmed(body.order ?? null, 'order') : null;

  if (name === null && order === null) {
    const err = new Error('Informe ao menos um texto em "name" ou "order".');
    err.name = VALIDATION;
    throw err;
  }

  return { name, order };
}

export function parseSetPatchBody(body: unknown): PatchSetInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchSetInput = {};
  let n = 0;
  if ('name' in body) {
    patch.name = expectNullableTrimmed(body.name, 'name');
    n++;
  }
  if ('order' in body) {
    patch.order = expectNullableTrimmed(body.order, 'order');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
