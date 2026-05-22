import type { CreatePointInput } from '../ports/points.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableTrimmedStringOrNull(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

/** Inteiro >= 0 ou null (corpo JSON pode enviar número ou string numérica). */
function expectNullableNonNegativeInt(value: unknown, field: string): number | null {
  if (value === null) return null;
  let n: number;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || !Number.isInteger(value)) {
      const err = new Error(`Campo "${field}" deve ser um inteiro >= 0 ou null.`);
      err.name = VALIDATION;
      throw err;
    }
    n = value;
  } else if (typeof value === 'string') {
    const t = value.trim();
    if (t.length === 0) return null;
    if (!/^[0-9]+$/.test(t)) {
      const err = new Error(`Campo "${field}" deve ser um inteiro >= 0 ou null.`);
      err.name = VALIDATION;
      throw err;
    }
    n = parseInt(t, 10);
  } else {
    const err = new Error(`Campo "${field}" deve ser inteiro, string numérica ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  if (n < 0) {
    const err = new Error(`Campo "${field}" deve ser um inteiro >= 0.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export function parsePointCreateBody(body: unknown): Omit<CreatePointInput, 'student_id'> {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const time = 'time' in body ? expectNullableTrimmedStringOrNull(body.time ?? null, 'time') : null;
  const qtt_excercise =
    'qtt_excercise' in body
      ? expectNullableNonNegativeInt(body.qtt_excercise ?? null, 'qtt_excercise')
      : null;
  if (time === null && qtt_excercise === null) {
    const err = new Error(
      'Informe ao menos "time" (texto) ou "qtt_excercise" (número inteiro >= 0).'
    );
    err.name = VALIDATION;
    throw err;
  }
  return { time, qtt_excercise };
}
