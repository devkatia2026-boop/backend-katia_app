import type { CreateProgramInput, PatchProgramInput } from '../ports/programs.port';

const VALIDATION = 'ValidationException';

const PROGRAM_TYPES = new Set(['casa', 'academia', 'ambos']);
const PROGRAM_LEVELS = new Set(['iniciante', 'intermediário', 'avançado']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNonEmptyTrimmed(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    const err = new Error(`Campo "${field}" deve ser uma string não vazia.`);
    err.name = VALIDATION;
    throw err;
  }
  return value.trim();
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

function expectNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableProgramType(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  if (t.length === 0) return null;
  if (!PROGRAM_TYPES.has(t)) {
    const err = new Error(`Campo "${field}" deve ser "casa", "academia" ou "ambos".`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

function expectNullableProgramLevel(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  if (t.length === 0) return null;
  if (!PROGRAM_LEVELS.has(t)) {
    const err = new Error(`Campo "${field}" deve ser "iniciante", "intermediário" ou "avançado".`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

export function parseProgramCreateBody(body: unknown): CreateProgramInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (typeof body.name !== 'string') {
    const err = new Error('Campo "name" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }

  return {
    name: expectNonEmptyTrimmed(body.name, 'name'),
    photo: 'photo' in body ? expectNullableTrimmed(body.photo ?? null, 'photo') : null,
    status: 'status' in body ? expectNullableBoolean(body.status ?? null, 'status') : null,
    type: 'type' in body ? expectNullableProgramType(body.type, 'type') : null,
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
    level: 'level' in body ? expectNullableProgramLevel(body.level, 'level') : null,
  };
}

export function parseProgramPatchBody(body: unknown): PatchProgramInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchProgramInput = {};
  let n = 0;
  if ('name' in body) {
    patch.name = body.name === null ? null : expectNonEmptyTrimmed(body.name, 'name');
    n++;
  }
  if ('photo' in body) {
    patch.photo = expectNullableTrimmed(body.photo, 'photo');
    n++;
  }
  if ('status' in body) {
    patch.status = expectNullableBoolean(body.status, 'status');
    n++;
  }
  if ('type' in body) {
    patch.type = body.type === null ? null : expectNullableProgramType(body.type, 'type');
    n++;
  }
  if ('description' in body) {
    patch.description = expectNullableTrimmed(body.description, 'description');
    n++;
  }
  if ('level' in body) {
    patch.level = body.level === null ? null : expectNullableProgramLevel(body.level, 'level');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
