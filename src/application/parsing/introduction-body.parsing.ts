import type { CreateIntroductionInput, PatchIntroductionInput } from '../ports/introductions.port';
import {
  CONTENT_BODY_VALIDATION,
  expectNullableTrimmed,
  expectPositiveInt,
  isPlainObject,
  parseOptionalPositiveIntQuery,
} from './content-body.parsing';

function validationError(message: string): never {
  const err = new Error(message);
  err.name = CONTENT_BODY_VALIDATION;
  throw err;
}

function expectRequiredTrimmedString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    validationError(`Campo "${field}" deve ser string.`);
  }
  const t = value.trim();
  if (t.length === 0) {
    validationError(`Campo "${field}" não pode ser vazio.`);
  }
  return t;
}

export function parseOptionalProgramIdQuery(raw: unknown): number | undefined {
  return parseOptionalPositiveIntQuery(raw, 'programId');
}

export function parseIntroductionCreateBody(body: unknown): CreateIntroductionInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('program_id' in body)) {
    validationError('Campo "program_id" é obrigatório.');
  }
  if (!('title' in body)) {
    validationError('Campo "title" é obrigatório.');
  }
  return {
    program_id: expectPositiveInt(body.program_id, 'program_id'),
    title: expectRequiredTrimmedString(body.title, 'title'),
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
  };
}

export function parseIntroductionPatchBody(body: unknown): PatchIntroductionInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  const patch: PatchIntroductionInput = {};
  let n = 0;

  if ('program_id' in body) {
    patch.program_id = expectPositiveInt(body.program_id, 'program_id');
    n++;
  }
  if ('title' in body) {
    patch.title = expectRequiredTrimmedString(body.title, 'title');
    n++;
  }
  if ('description' in body) {
    patch.description = expectNullableTrimmed(body.description, 'description');
    n++;
  }

  if (n === 0) {
    validationError('Envie ao menos um campo para atualizar.');
  }
  return patch;
}
