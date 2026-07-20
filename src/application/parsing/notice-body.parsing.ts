import type { CreateNoticeInput, NoticeAudiencePlan } from '../ports/notices.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    const err = new Error(`Campo "${field}" deve ser uma string não vazia.`);
    err.name = VALIDATION;
    throw err;
  }
  return value.trim();
}

function parseNoticeAudiencePlan(value: unknown, field: string): NoticeAudiencePlan {
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser "exclusive", "comum" ou "ambos".`);
    err.name = VALIDATION;
    throw err;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'exclusive' || normalized === 'comum' || normalized === 'ambos') {
    return normalized;
  }
  const err = new Error(`Campo "${field}" deve ser "exclusive", "comum" ou "ambos".`);
  err.name = VALIDATION;
  throw err;
}

export function parseNoticeCreateBody(body: unknown): Omit<CreateNoticeInput, 'trainer_id'> {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  if (!('message' in body)) {
    const err = new Error('Campo "message" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  if (!('type_plan' in body)) {
    const err = new Error('Campo "type_plan" é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }

  return {
    message: expectNonEmptyString(body.message, 'message'),
    type_plan: parseNoticeAudiencePlan(body.type_plan, 'type_plan'),
  };
}
