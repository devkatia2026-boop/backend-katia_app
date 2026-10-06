import type { CreateContentInput, PatchContentInput } from '../ports/contents.port';
import {
  CONTENT_BODY_VALIDATION,
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

export function parseOptionalIntroductionIdQuery(raw: unknown): number | undefined {
  return parseOptionalPositiveIntQuery(raw, 'introductionId');
}

export function parseContentCreateBody(body: unknown): CreateContentInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('introduction_id' in body)) {
    validationError('Campo "introduction_id" é obrigatório.');
  }
  if (!('link' in body)) {
    validationError('Campo "link" é obrigatório.');
  }
  if (!('type' in body)) {
    validationError('Campo "type" é obrigatório.');
  }
  return {
    introduction_id: expectPositiveInt(body.introduction_id, 'introduction_id'),
    link: expectRequiredTrimmedString(body.link, 'link'),
    type: expectRequiredTrimmedString(body.type, 'type'),
  };
}

export function parseContentPatchBody(body: unknown): PatchContentInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  const patch: PatchContentInput = {};
  let n = 0;

  if ('introduction_id' in body) {
    patch.introduction_id = expectPositiveInt(body.introduction_id, 'introduction_id');
    n++;
  }
  if ('link' in body) {
    patch.link = expectRequiredTrimmedString(body.link, 'link');
    n++;
  }
  if ('type' in body) {
    patch.type = expectRequiredTrimmedString(body.type, 'type');
    n++;
  }

  if (n === 0) {
    validationError('Envie ao menos um campo para atualizar.');
  }
  return patch;
}
