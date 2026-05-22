import type {
  CreateSetToTrainingInput,
  PatchSetToTrainingInput,
} from '../ports/sets-to-trainings.port';

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

export function parseSetToTrainingCreateBody(body: unknown): CreateSetToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('training_id' in body) || !('set_id' in body)) {
    const err = new Error('Campos "training_id" e "set_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    training_id: expectPositiveInt(body.training_id, 'training_id'),
    set_id: expectPositiveInt(body.set_id, 'set_id'),
  };
}

export function parseSetToTrainingPatchBody(body: unknown): PatchSetToTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchSetToTrainingInput = {};
  let n = 0;
  if ('training_id' in body) {
    patch.training_id = expectPositiveInt(body.training_id, 'training_id');
    n++;
  }
  if ('set_id' in body) {
    patch.set_id = expectPositiveInt(body.set_id, 'set_id');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
