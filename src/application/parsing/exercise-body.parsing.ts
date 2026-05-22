import type { CreateExerciseInput, PatchExerciseInput } from '../ports/exercises.port';

const VALIDATION = 'ValidationException';

const EXERCISE_TYPES = new Set(['casa', 'academia', 'ambos']);
const EXERCISE_LEVELS = new Set(['iniciante', 'intermediário', 'avançado']);

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

function expectNullableExerciseType(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  if (t.length === 0) return null;
  if (!EXERCISE_TYPES.has(t)) {
    const err = new Error(`Campo "${field}" deve ser "casa", "academia" ou "ambos".`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

function expectNullableExerciseLevel(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  if (t.length === 0) return null;
  if (!EXERCISE_LEVELS.has(t)) {
    const err = new Error(`Campo "${field}" deve ser "iniciante", "intermediário" ou "avançado".`);
    err.name = VALIDATION;
    throw err;
  }
  return t;
}

export function parseExerciseCreateBody(body: unknown): CreateExerciseInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  return {
    name: 'name' in body ? expectNullableTrimmed(body.name ?? null, 'name') : null,
    video: 'video' in body ? expectNullableTrimmed(body.video ?? null, 'video') : null,
    type: 'type' in body ? expectNullableExerciseType(body.type ?? null, 'type') : null,
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
    level: 'level' in body ? expectNullableExerciseLevel(body.level ?? null, 'level') : null,
  };
}

export function parseExercisePatchBody(body: unknown): PatchExerciseInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const patch: PatchExerciseInput = {};
  let n = 0;

  if ('name' in body) {
    patch.name = expectNullableTrimmed(body.name, 'name');
    n++;
  }
  if ('video' in body) {
    patch.video = expectNullableTrimmed(body.video, 'video');
    n++;
  }
  if ('type' in body) {
    patch.type = body.type === null ? null : expectNullableExerciseType(body.type, 'type');
    n++;
  }
  if ('description' in body) {
    patch.description = expectNullableTrimmed(body.description, 'description');
    n++;
  }
  if ('level' in body) {
    patch.level = body.level === null ? null : expectNullableExerciseLevel(body.level, 'level');
    n++;
  }

  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}

