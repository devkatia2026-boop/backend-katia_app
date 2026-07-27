const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectBoolean(value: unknown, field: string): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t === 'true') return true;
    if (t === 'false') return false;
  }
  const err = new Error(`Campo "${field}" deve ser boolean.`);
  err.name = VALIDATION;
  throw err;
}

export function parseSemesterPromotionPatchBody(body: unknown): { semester_promotion: boolean } {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('semester_promotion' in body)) {
    const err = new Error('Campo "semester_promotion" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  return { semester_promotion: expectBoolean(body.semester_promotion, 'semester_promotion') };
}
