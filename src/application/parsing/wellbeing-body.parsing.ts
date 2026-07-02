import type { CreateWellbeingInput, PatchWellbeingInput } from '../ports/wellbeing.port';
import {
  CONTENT_BODY_VALIDATION,
  expectNullableBoolean,
  expectNullableTrimmed,
  isPlainObject,
} from './content-body.parsing';

export function parseWellbeingCreateBody(body: unknown): CreateWellbeingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  return {
    status: 'status' in body ? expectNullableBoolean(body.status ?? null, 'status') : null,
    photo: 'photo' in body ? expectNullableTrimmed(body.photo ?? null, 'photo') : null,
    tittle: 'tittle' in body ? expectNullableTrimmed(body.tittle ?? null, 'tittle') : null,
    tags: 'tags' in body ? expectNullableTrimmed(body.tags ?? null, 'tags') : null,
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
  };
}

export function parseWellbeingPatchBody(body: unknown): PatchWellbeingInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  const patch: PatchWellbeingInput = {};
  let n = 0;

  if ('status' in body) {
    patch.status = expectNullableBoolean(body.status, 'status');
    n++;
  }
  if ('photo' in body) {
    patch.photo = expectNullableTrimmed(body.photo, 'photo');
    n++;
  }
  if ('tittle' in body) {
    patch.tittle = expectNullableTrimmed(body.tittle, 'tittle');
    n++;
  }
  if ('tags' in body) {
    patch.tags = expectNullableTrimmed(body.tags, 'tags');
    n++;
  }
  if ('description' in body) {
    patch.description = expectNullableTrimmed(body.description, 'description');
    n++;
  }

  if (n === 0) {
    const err = new Error('Envie ao menos um campo para atualizar.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  return patch;
}
