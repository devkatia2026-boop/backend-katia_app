import type { CreateWellInput, PatchWellInput } from '../ports/wells.port';
import {
  CONTENT_BODY_VALIDATION,
  expectNullableBoolean,
  expectNullableTrimmed,
  expectPositiveInt,
  isPlainObject,
} from './content-body.parsing';

export function parseWellCreateBody(body: unknown): CreateWellInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  if (!('wellbeing_id' in body)) {
    const err = new Error('Campo "wellbeing_id" é obrigatório.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  return {
    wellbeing_id: expectPositiveInt(body.wellbeing_id, 'wellbeing_id'),
    status: 'status' in body ? expectNullableBoolean(body.status ?? null, 'status') : null,
    photo: 'photo' in body ? expectNullableTrimmed(body.photo ?? null, 'photo') : null,
    video_link: 'video_link' in body ? expectNullableTrimmed(body.video_link ?? null, 'video_link') : null,
    tittle: 'tittle' in body ? expectNullableTrimmed(body.tittle ?? null, 'tittle') : null,
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
  };
}

export function parseWellPatchBody(body: unknown): PatchWellInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  const patch: PatchWellInput = {};
  let n = 0;

  if ('wellbeing_id' in body) {
    patch.wellbeing_id = expectPositiveInt(body.wellbeing_id, 'wellbeing_id');
    n++;
  }
  if ('status' in body) {
    patch.status = expectNullableBoolean(body.status, 'status');
    n++;
  }
  if ('photo' in body) {
    patch.photo = expectNullableTrimmed(body.photo, 'photo');
    n++;
  }
  if ('video_link' in body) {
    patch.video_link = expectNullableTrimmed(body.video_link, 'video_link');
    n++;
  }
  if ('tittle' in body) {
    patch.tittle = expectNullableTrimmed(body.tittle, 'tittle');
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
