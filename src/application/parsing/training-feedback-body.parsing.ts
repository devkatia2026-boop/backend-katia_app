import type { CreateTrainingFeedbackInput } from '../ports/feedbacks.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableTrimmedStringOrNull(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

export function parseTrainingFeedbackCreateBody(
  body: unknown
): Omit<CreateTrainingFeedbackInput, 'student_id'> {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const effort = 'effort' in body ? expectNullableTrimmedStringOrNull(body.effort ?? null, 'effort') : null;
  const feedback =
    'feedback' in body
      ? expectNullableTrimmedStringOrNull(body.feedback ?? null, 'feedback')
      : null;
  if (effort === null && feedback === null) {
    const err = new Error('Informe ao menos "effort" ou "feedback" com texto.');
    err.name = VALIDATION;
    throw err;
  }
  return { effort, feedback };
}
