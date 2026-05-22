import type {
  CreateExerciseToTrainingInput,
  PatchExerciseToTrainingInput,
} from '../ports/exercises-to-trainings.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectPositiveInt(value: unknown, field: string): number {
  let n: number;
  if (typeof value === 'number') {
    n = value;
  } else if (typeof value === 'string') {
    n = parseInt(value, 10);
  } else {
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

export function parseExerciseToTrainingCreateBody(body: unknown): CreateExerciseToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('training_id' in body) || !('exercise_id' in body)) {
    const err = new Error('Campos "training_id" e "exercise_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    training_id: expectPositiveInt(body.training_id, 'training_id'),
    exercise_id: expectPositiveInt(body.exercise_id, 'exercise_id'),
  };
}

export function parseExerciseToTrainingPatchBody(body: unknown): PatchExerciseToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchExerciseToTrainingInput = {};
  let n = 0;
  if ('training_id' in body) {
    patch.training_id = expectPositiveInt(body.training_id, 'training_id');
    n++;
  }
  if ('exercise_id' in body) {
    patch.exercise_id = expectPositiveInt(body.exercise_id, 'exercise_id');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
