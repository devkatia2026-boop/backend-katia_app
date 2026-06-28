import type { CreateProgramToStudentInput } from '../ports/programs-to-students.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  return t.toLowerCase();
}

export function parseProgramToStudentCreateBody(body: unknown): Pick<CreateProgramToStudentInput, 'program_id'> {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('program_id' in body)) {
    const err = new Error('Campo "program_id" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    program_id: expectPositiveInt(body.program_id, 'program_id'),
  };
}

export function parseOptionalUuid(value: unknown, field: string): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectUuid(value, field);
}

export function parseOptionalProgramId(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectPositiveInt(value, field);
}

export function parseProgramIdQuery(value: unknown, field = 'programId'): number {
  if (value === undefined || value === null || value === '') {
    const err = new Error(`Parâmetro "${field}" é obrigatório.`);
    err.name = VALIDATION;
    throw err;
  }
  return expectPositiveInt(value, field);
}
