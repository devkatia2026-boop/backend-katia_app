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

function parseSetTrainingOrder(raw: string | null): number[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value) && value >= 1);
}

function expectOrderWithTrainings(value: unknown, field: string): string {
  const order = expectNullableTrimmed(value, field);

  if (order === null || parseSetTrainingOrder(order).length === 0) {
    const err = new Error(`Campo "${field}" deve conter ao menos um treino.`);
    err.name = VALIDATION;
    throw err;
  }

  return order;
}

/** Criação: `order` deve conter ao menos um id de treino. */
export function parseSetCreateBody(body: unknown): CreateSetInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const name = 'name' in body ? expectNullableTrimmed(body.name ?? null, 'name') : null;
  const cardio = 'cardio' in body ? expectNullableTrimmed(body.cardio ?? null, 'cardio') : null;
  const stretching =
    'stretching' in body ? expectNullableTrimmed(body.stretching ?? null, 'stretching') : null;
  const order = expectOrderWithTrainings(body.order ?? null, 'order');

  return { name, order, cardio, stretching };
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
  if ('cardio' in body) {
    patch.cardio = expectNullableTrimmed(body.cardio, 'cardio');
    n++;
  }
  if ('stretching' in body) {
    patch.stretching = expectNullableTrimmed(body.stretching, 'stretching');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
