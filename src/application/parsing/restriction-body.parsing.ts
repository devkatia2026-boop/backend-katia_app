import type { CreateRestrictionInput, RestrictionType } from '../ports/restrictions.port';
import type { RestrictionAuthorType } from '../ports/restrictions.port';
import {
  CONTENT_BODY_VALIDATION,
  expectPositiveInt,
  expectUuidString,
  isPlainObject,
} from './content-body.parsing';

const RESTRICTION_TYPES = new Set<RestrictionType>(['student', 'trainer', 'post', 'comment']);
const TARGET_TYPES = new Set(['student', 'trainer']);

function validationError(message: string): never {
  const err = new Error(message);
  err.name = CONTENT_BODY_VALIDATION;
  throw err;
}

function expectRestrictionType(value: unknown): RestrictionType {
  if (typeof value !== 'string' || !RESTRICTION_TYPES.has(value as RestrictionType)) {
    validationError(
      'Campo "restriction_type" deve ser "student", "trainer", "post" ou "comment".'
    );
  }
  return value as RestrictionType;
}

export function parseRestrictionCreateBody(
  body: unknown,
  authorId: string,
  authorType: RestrictionAuthorType
): CreateRestrictionInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('restriction_type' in body)) {
    validationError('Campo "restriction_type" é obrigatório.');
  }

  const restriction_type = expectRestrictionType(body.restriction_type);
  const input: CreateRestrictionInput = {
    author_id: authorId,
    author_type: authorType,
    restriction_type,
    content_type:
      'content_type' in body && typeof body.content_type === 'string'
        ? body.content_type.trim() || null
        : null,
  };

  if (restriction_type === 'post') {
    if (!('post_id' in body)) validationError('Campo "post_id" é obrigatório para bloquear post.');
    input.post_id = expectPositiveInt(body.post_id, 'post_id');
    return input;
  }

  if (restriction_type === 'comment') {
    if (!('comment_id' in body)) {
      validationError('Campo "comment_id" é obrigatório para bloquear comentário.');
    }
    input.comment_id = expectPositiveInt(body.comment_id, 'comment_id');
    return input;
  }

  if (!('target_id' in body)) {
    validationError('Campo "target_id" é obrigatório para bloquear usuário.');
  }
  input.target_id = expectUuidString(body.target_id, 'target_id');
  input.target_type = restriction_type;
  return input;
}
