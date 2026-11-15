import type { CreateSubjectWellInput, PatchSubjectWellInput } from '../ports/subject-wells.port';
import {
  CONTENT_BODY_VALIDATION,
  expectPositiveInt,
  isPlainObject,
  parseOptionalPositiveIntQuery,
} from './content-body.parsing';
import { normalizeWellSubjectType } from './well-subject-types';

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

export function parseOptionalWellIdQuery(raw: unknown): number | undefined {
  return parseOptionalPositiveIntQuery(raw, 'wellId');
}

export function parseSubjectWellCreateBody(body: unknown): CreateSubjectWellInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }

  if (!('well_id' in body)) {
    validationError('Campo "well_id" é obrigatório.');
  }

  if (!('midia' in body)) {
    validationError('Campo "midia" é obrigatório.');
  }

  if (!('type' in body)) {
    validationError('Campo "type" é obrigatório.');
  }

  const type = normalizeWellSubjectType(expectRequiredTrimmedString(body.type, 'type'));

  return {
    well_id: expectPositiveInt(body.well_id, 'well_id'),
    midia: expectRequiredTrimmedString(body.midia, 'midia'),
    type,
  };
}

export function parseSubjectWellPatchBody(body: unknown): PatchSubjectWellInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }

  const patch: PatchSubjectWellInput = {};
  let n = 0;

  if ('well_id' in body) {
    patch.well_id = expectPositiveInt(body.well_id, 'well_id');
    n++;
  }

  if ('midia' in body) {
    patch.midia = expectRequiredTrimmedString(body.midia, 'midia');
    n++;
  }

  if ('type' in body) {
    patch.type = normalizeWellSubjectType(expectRequiredTrimmedString(body.type, 'type'));
    n++;
  }

  if (n === 0) {
    validationError('Envie ao menos um campo para atualizar.');
  }

  return patch;
}