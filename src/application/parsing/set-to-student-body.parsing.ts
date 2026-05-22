import type { CreateSetToStudentInput, PatchSetToStudentInput } from '../ports/sets-to-students.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function expectUuid(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser UUID (string).`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  if (!UUID_RE.test(t)) {
    const err = new Error(`Campo "${field}" deve ser um UUID válido.`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

function expectPositiveInt(value: unknown, field: string): number {
  let n: number;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string') n = parseInt(value, 10);
  else {
    const err = new Error(`Campo "${field}" deve ser um inteiro positivo.`);
    err.name = VALIDATION;
    throw err;
  }
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    const err = new Error(`Campo "${field}" deve ser um inteiro positivo.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

function expectOptionalBoolOrNull(value: unknown, field: string): boolean | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectOptionalNullableTrimmedString(value: unknown, field: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export function parseSetToStudentCreateBody(body: unknown): CreateSetToStudentInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('student_id' in body) || !('setstotrainings_id' in body)) {
    const err = new Error('Campos "student_id" e "setstotrainings_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  const validityRaw = 'validity' in body ? body.validity : undefined;
  const statusRaw = 'status' in body ? body.status : undefined;
  return {
    student_id: expectUuid(body.student_id, 'student_id'),
    setstotrainings_id: expectPositiveInt(body.setstotrainings_id, 'setstotrainings_id'),
    validity:
      validityRaw === undefined ? null : expectOptionalNullableTrimmedString(validityRaw, 'validity') ?? null,
    status: statusRaw === undefined ? null : expectOptionalBoolOrNull(statusRaw, 'status') ?? null,
  };
}

export function parseSetToStudentPatchBody(body: unknown): PatchSetToStudentInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchSetToStudentInput = {};
  let n = 0;
  if ('student_id' in body) {
    patch.student_id = expectUuid(body.student_id, 'student_id');
    n++;
  }
  if ('setstotrainings_id' in body) {
    patch.setstotrainings_id = expectPositiveInt(body.setstotrainings_id, 'setstotrainings_id');
    n++;
  }
  if ('validity' in body) {
    patch.validity = expectOptionalNullableTrimmedString(body.validity, 'validity') ?? null;
    n++;
  }
  if ('status' in body) {
    patch.status = expectOptionalBoolOrNull(body.status, 'status') ?? null;
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}

export function parseOptionalUuid(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectUuid(value, field);
}

export function parseOptionalSetstotrainingsId(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectPositiveInt(value, field);
}
