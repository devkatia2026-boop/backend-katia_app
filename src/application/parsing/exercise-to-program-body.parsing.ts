import type {
  CreateExerciseToProgramInput,
  PatchExerciseToProgramInput,
} from '../ports/exercises-to-programs.port';

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

export function parseExerciseToProgramCreateBody(body: unknown): CreateExerciseToProgramInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('program_id' in body) || !('exercise_id' in body)) {
    const err = new Error('Campos "program_id" e "exercise_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    program_id: expectPositiveInt(body.program_id, 'program_id'),
    exercise_id: expectPositiveInt(body.exercise_id, 'exercise_id'),
  };
}

export function parseExerciseToProgramPatchBody(body: unknown): PatchExerciseToProgramInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchExerciseToProgramInput = {};
  let n = 0;
  if ('program_id' in body) {
    patch.program_id = expectPositiveInt(body.program_id, 'program_id');
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
