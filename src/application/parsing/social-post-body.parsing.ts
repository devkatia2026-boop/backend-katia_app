const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nullableTrimmedText(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export function parseCreatePostBody(body: unknown): { content: string | null; image: string | null } {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const content = 'content' in body ? nullableTrimmedText(body.content, 'content') : null;
  const image = 'image' in body ? nullableTrimmedText(body.image, 'image') : null;
  if (content === null && image === null) {
    const err = new Error('Informe ao menos `content` ou `image`.');
    err.name = VALIDATION;
    throw err;
  }
  return { content, image };
}

export function parsePatchPostBody(body: unknown): { content?: string | null; image?: string | null } {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const patch: { content?: string | null; image?: string | null } = {};
  if ('content' in body) patch.content = nullableTrimmedText(body.content, 'content');
  if ('image' in body) patch.image = nullableTrimmedText(body.image, 'image');
  if (Object.keys(patch).length === 0) {
    const err = new Error('Informe ao menos um campo para atualizar.');
    err.name = VALIDATION;
    throw err;
  }
  return patch;
}

export function parseCreateCommentBody(body: unknown): string {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('content' in body)) {
    const err = new Error('Campo "content" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  const c = nullableTrimmedText(body.content, 'content');
  if (c === null) {
    const err = new Error('Campo "content" não pode ser vazio.');
    err.name = VALIDATION;
    throw err;
  }
  return c;
}

export function parsePatchCommentBody(body: unknown): string {
  return parseCreateCommentBody(body);
}
