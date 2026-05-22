import type { PhysicalUpsertValues } from '../ports/student-physicals.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableNumber(value: unknown, field: string): number | null {
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const err = new Error(`Campo "${field}" deve ser número finito ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export function parsePhysicalUpsertBody(body: unknown): PhysicalUpsertValues {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const out: PhysicalUpsertValues = {};
  if ('weight' in body) out.weight = expectNullableNumber(body.weight, 'weight');
  if ('height' in body) out.height = expectNullableNumber(body.height, 'height');
  if ('objective' in body) out.objective = expectNullableString(body.objective, 'objective');
  return out;
}
