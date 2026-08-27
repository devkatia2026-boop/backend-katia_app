import type { CreateRepsToTrainingInput, PatchRepsToTrainingInput } from '../ports/reps-to-trainings.port';

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

export function parseRepsToTrainingCreateBody(body: unknown): CreateRepsToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('exercise_id' in body) || !('training_id' in body)) {
    const err = new Error('Campos "exercise_id" e "training_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  const reps = 'reps' in body ? expectNullableTrimmedStringOrNull(body.reps ?? null, 'reps') : null;
  const obs = 'obs' in body ? expectNullableTrimmedStringOrNull(body.obs ?? null, 'obs') : null;
  const methodology =
    'methodology' in body
      ? expectNullableTrimmedStringOrNull(body.methodology ?? null, 'methodology')
      : null;
  const rest = 'rest' in body ? expectNullableTrimmedStringOrNull(body.rest ?? null, 'rest') : null;
  if (reps === null && obs === null) {
    const err = new Error('Informe ao menos "reps" ou "obs" com texto.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    exercise_id: expectPositiveInt(body.exercise_id, 'exercise_id'),
    training_id: expectPositiveInt(body.training_id, 'training_id'),
    reps,
    obs,
    methodology,
    rest,
  };
}

export function parseRepsToTrainingPatchBody(body: unknown): PatchRepsToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchRepsToTrainingInput = {};
  let n = 0;
  if ('exercise_id' in body) {
    patch.exercise_id = expectPositiveInt(body.exercise_id, 'exercise_id');
    n++;
  }
  if ('training_id' in body) {
    patch.training_id = expectPositiveInt(body.training_id, 'training_id');
    n++;
  }
  if ('reps' in body) {
    patch.reps = expectNullableTrimmedStringOrNull(body.reps, 'reps');
    n++;
  }
  if ('obs' in body) {
    patch.obs = expectNullableTrimmedStringOrNull(body.obs, 'obs');
    n++;
  }
  if ('methodology' in body) {
    patch.methodology = expectNullableTrimmedStringOrNull(body.methodology, 'methodology');
    n++;
  }
  if ('rest' in body) {
    patch.rest = expectNullableTrimmedStringOrNull(body.rest, 'rest');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}

export function parseExerciseIdQuery(value: unknown, field: string): number {
  if (value === undefined || value === null || value === '') {
    const err = new Error(`Parâmetro "${field}" é obrigatório.`);
    err.name = VALIDATION;
    throw err;
  }
  return expectPositiveInt(Array.isArray(value) ? value[0] : value, field);
}

export function parseTrainingIdQuery(value: unknown, field: string): number {
  if (value === undefined || value === null || value === '') {
    const err = new Error(`Parâmetro "${field}" é obrigatório.`);
    err.name = VALIDATION;
    throw err;
  }
  return expectPositiveInt(Array.isArray(value) ? value[0] : value, field);
}

export function parseOptionalTrainingIdQuery(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectPositiveInt(Array.isArray(value) ? value[0] : value, field);
}
