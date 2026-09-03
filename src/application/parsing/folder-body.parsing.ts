import type { CreateFolderInput, FolderKind, PatchFolderInput } from '../ports/folders.port';

const VALIDATION = 'ValidationException';

const FOLDER_KINDS: FolderKind[] = ['T', 'E', 'S'];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validationError(message: string): never {
  const err = new Error(message);
  err.name = VALIDATION;
  throw err;
}

function expectTitle(value: unknown): string {
  if (typeof value !== 'string') {
    validationError('Campo "title" deve ser string.');
  }
  const t = value.trim();
  if (t.length === 0) {
    validationError('Campo "title" não pode ser vazio.');
  }
  return t;
}

function expectFolderKind(value: unknown): FolderKind {
  if (typeof value !== 'string') {
    validationError('Campo "type" deve ser "T", "E" ou "S".');
  }
  const t = value.trim().toUpperCase();
  if (!FOLDER_KINDS.includes(t as FolderKind)) {
    validationError('Campo "type" deve ser "T", "E" ou "S".');
  }
  return t as FolderKind;
}

export function parseOptionalFolderKindQuery(value: unknown): FolderKind | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  return expectFolderKind(Array.isArray(value) ? value[0] : value);
}

export function parseFolderCreateBody(body: unknown): CreateFolderInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('title' in body)) {
    validationError('Campo "title" é obrigatório.');
  }
  if (!('type' in body)) {
    validationError('Campo "type" é obrigatório.');
  }
  return {
    title: expectTitle(body.title),
    type: expectFolderKind(body.type),
  };
}

export function parseFolderPatchBody(body: unknown): PatchFolderInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('title' in body)) {
    validationError('Envie ao menos um campo para atualizar.');
  }
  return { title: expectTitle(body.title) };
}
