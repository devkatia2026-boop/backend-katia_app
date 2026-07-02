const VALIDATION = 'ValidationException';

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function expectNullableTrimmed(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export function expectNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t.length === 0) return null;
    if (t === 'true') return true;
    if (t === 'false') return false;
  }
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

export function expectPositiveInt(value: unknown, field: string): number {
  let n: number;
  if (typeof value === 'number') {
    n = value;
  } else if (typeof value === 'string') {
    n = parseInt(value.trim(), 10);
  } else {
    const err = new Error(`Campo "${field}" deve ser um inteiro positivo.`);
    err.name = VALIDATION;
    throw err;
  }
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`Campo "${field}" deve ser um inteiro positivo.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export function parseOptionalPositiveIntQuery(raw: unknown, field: string): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return expectPositiveInt(value, field);
}

export function parseResourceId(raw: string | undefined, label: string): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${label} inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export { VALIDATION as CONTENT_BODY_VALIDATION };
