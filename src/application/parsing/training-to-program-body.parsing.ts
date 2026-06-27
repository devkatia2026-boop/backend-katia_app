import type { CreateTrainingToProgramInput } from '../ports/trainings-to-programs.port';

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

export function parseTrainingToProgramCreateBody(body: unknown): CreateTrainingToProgramInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('program_id' in body) || !('training_id' in body)) {
    const err = new Error('Campos "program_id" e "training_id" são obrigatórios.');
    err.name = VALIDATION;
    throw err;
  }
  return {
    program_id: expectPositiveInt(body.program_id, 'program_id'),
    training_id: expectPositiveInt(body.training_id, 'training_id'),
  };
}
