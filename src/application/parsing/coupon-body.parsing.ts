import type { CreateCouponInput, PatchCouponInput } from '../ports/coupons.port';
import {
  CONTENT_BODY_VALIDATION,
  expectNullableBoolean,
  expectNullableTrimmed,
  isPlainObject,
} from './content-body.parsing';

export function parseCouponCreateBody(body: unknown): CreateCouponInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  return {
    status: 'status' in body ? expectNullableBoolean(body.status ?? null, 'status') : null,
    photo: 'photo' in body ? expectNullableTrimmed(body.photo ?? null, 'photo') : null,
    site: 'site' in body ? expectNullableTrimmed(body.site ?? null, 'site') : null,
    code: 'code' in body ? expectNullableTrimmed(body.code ?? null, 'code') : null,
    site_name: 'site_name' in body ? expectNullableTrimmed(body.site_name ?? null, 'site_name') : null,
    description:
      'description' in body ? expectNullableTrimmed(body.description ?? null, 'description') : null,
  };
}

export function parseCouponPatchBody(body: unknown): PatchCouponInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }

  const patch: PatchCouponInput = {};
  let n = 0;

  if ('status' in body) {
    patch.status = expectNullableBoolean(body.status, 'status');
    n++;
  }
  if ('photo' in body) {
    patch.photo = expectNullableTrimmed(body.photo, 'photo');
    n++;
  }
  if ('site' in body) {
    patch.site = expectNullableTrimmed(body.site, 'site');
    n++;
  }
  if ('code' in body) {
    patch.code = expectNullableTrimmed(body.code, 'code');
    n++;
  }
  if ('site_name' in body) {
    patch.site_name = expectNullableTrimmed(body.site_name, 'site_name');
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
