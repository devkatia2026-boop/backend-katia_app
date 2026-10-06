import type { PatchMethodProgramInput } from '../ports/method-programs.port';
import {
  CONTENT_BODY_VALIDATION,
  isPlainObject,
} from './content-body.parsing';

function validationError(message: string): never {
  const err = new Error(message);
  err.name = CONTENT_BODY_VALIDATION;
  throw err;
}

function parseOptionalNullableDescription(value: unknown): string | null {
  if (value === null) {
    return null;
  }

  if (typeof value !== 'string') {
    validationError('Campo "description" deve ser string ou null.');
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function parseMethodProgramPatchBody(body: unknown): PatchMethodProgramInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }

  if (!('description' in body)) {
    validationError('Envie ao menos um campo para atualizar.');
  }

  return {
    description: parseOptionalNullableDescription(body.description),
  };
}
