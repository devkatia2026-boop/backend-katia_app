import type { CreateTrainingInput, PatchTrainingInput } from '../ports/trainings.port';

const VALIDATION = 'ValidationException';

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

/** Criação: ao menos `lyric` ou `description` deve ter texto após trim. */
export function parseTrainingCreateBody(body: unknown): CreateTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const lyric = 'lyric' in body ? expectNullableTrimmed(body.lyric ?? null, 'lyric') : null;
  const description =
    'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null;

  if (lyric === null && description === null) {
    const err = new Error('Informe ao menos um texto em "lyric" ou "description".');
    err.name = VALIDATION;
    throw err;
  }

  return { lyric, description };
}

export function parseTrainingPatchBody(body: unknown): PatchTrainingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: PatchTrainingInput = {};
  let n = 0;
  if ('lyric' in body) {
    patch.lyric = expectNullableTrimmed(body.lyric, 'lyric');
    n++;
  }
  if ('description' in body) {
    patch.description = expectNullableTrimmed(body.description, 'description');
    n++;
  }
  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}
