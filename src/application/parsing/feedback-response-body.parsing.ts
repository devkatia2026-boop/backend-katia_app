import type {
  CreateFeedbackResponseInput,
  PatchFeedbackResponseInput,
} from '../ports/feedback-responses.port';
import {
  CONTENT_BODY_VALIDATION,
  expectNullableTrimmed,
  isPlainObject,
} from './content-body.parsing';

function expectNonEmptyResponse(value: unknown, field: string): string {
  const text = expectNullableTrimmed(value, field);
  if (text === null) {
    const err = new Error(`Campo "${field}" deve ser uma string não vazia.`);
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  return text;
}

export function parseFeedbackResponseCreateBody(body: unknown): Omit<CreateFeedbackResponseInput, 'feedback_id'> {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  if (!('response' in body)) {
    const err = new Error('Campo "response" é obrigatório.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  return {
    response: expectNonEmptyResponse(body.response, 'response'),
  };
}

export function parseFeedbackResponsePatchBody(body: unknown): PatchFeedbackResponseInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  if (!('response' in body)) {
    const err = new Error('Campo "response" é obrigatório.');
    err.name = CONTENT_BODY_VALIDATION;
    throw err;
  }
  return {
    response: expectNonEmptyResponse(body.response, 'response'),
  };
}
