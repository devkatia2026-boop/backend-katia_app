import {
  CONTENT_BODY_VALIDATION,
  expectNullableTrimmed,
  expectPositiveInt,
  expectUuidString,
  isPlainObject,
} from './content-body.parsing';

export type SocialReportType = 'post' | 'comment' | 'student';

export type SocialReportInput = {
  report_type: SocialReportType;
  post_id?: number;
  comment_id?: number;
  target_id?: string;
  reason: string | null;
};

const REPORT_TYPES = new Set<SocialReportType>(['post', 'comment', 'student']);

function validationError(message: string): never {
  const err = new Error(message);
  err.name = CONTENT_BODY_VALIDATION;
  throw err;
}

function expectReportType(value: unknown): SocialReportType {
  if (typeof value !== 'string' || !REPORT_TYPES.has(value as SocialReportType)) {
    validationError('Campo "report_type" deve ser "post", "comment" ou "student".');
  }
  return value as SocialReportType;
}

export function parseSocialReportBody(body: unknown): SocialReportInput {
  if (!isPlainObject(body)) {
    validationError('Corpo da requisição deve ser um objeto JSON.');
  }
  if (!('report_type' in body)) {
    validationError('Campo "report_type" é obrigatório.');
  }

  const report_type = expectReportType(body.report_type);
  const reason = 'reason' in body ? expectNullableTrimmed(body.reason, 'reason') : null;

  if (report_type === 'post') {
    if (!('post_id' in body)) validationError('Campo "post_id" é obrigatório.');
    return { report_type, post_id: expectPositiveInt(body.post_id, 'post_id'), reason };
  }
  if (report_type === 'comment') {
    if (!('comment_id' in body)) validationError('Campo "comment_id" é obrigatório.');
    return {
      report_type,
      comment_id: expectPositiveInt(body.comment_id, 'comment_id'),
      reason,
    };
  }
  if (!('target_id' in body)) validationError('Campo "target_id" é obrigatório.');
  return {
    report_type,
    target_id: expectUuidString(body.target_id, 'target_id'),
    reason,
  };
}
