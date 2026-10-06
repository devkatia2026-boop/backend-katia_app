import type { CreateMethodInput, PatchMethodInput } from '../ports/methods.port';
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

export function parseOptionalMethodProgramIdQuery(raw: unknown): number | undefined {
  return parseOptionalPositiveIntQuery(raw, 'methodProgramId');
}

export function parseMethodCreateBody(body: unknown): CreateMethodInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('method_program_id' in body)) {
    validationError('Campo "method_program_id" é obrigatório.');
  }
  if (!('title' in body)) {
    validationError('Campo "title" é obrigatório.');
  }
  if (!('link' in body)) {
    validationError('Campo "link" é obrigatório.');
  }
  return {
    method_program_id: expectPositiveInt(body.method_program_id, 'method_program_id'),
    title: expectRequiredTrimmedString(body.title, 'title'),
    link: expectRequiredTrimmedString(body.link, 'link'),
  };
}

export function parseMethodPatchBody(body: unknown): PatchMethodInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  const patch: PatchMethodInput = {};
  let n = 0;

  if ('method_program_id' in body) {
    patch.method_program_id = expectPositiveInt(body.method_program_id, 'method_program_id');
    n++;
  }
  if ('title' in body) {
    patch.title = expectRequiredTrimmedString(body.title, 'title');
    n++;
  }
  if ('link' in body) {
    patch.link = expectRequiredTrimmedString(body.link, 'link');
    n++;
  }

  if (n === 0) {
    validationError('Envie ao menos um campo para atualizar.');
  }
  return patch;
}
