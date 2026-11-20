const VALIDATION = 'ValidationException';
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ConversationBroadcastAudience = 'all' | 'active' | 'selected';

export type ConversationBroadcastInput = {
  text: string;
  audience: ConversationBroadcastAudience;
  student_ids: string[];
};

function validation(message: string): Error {
  const err = new Error(message);
  err.name = VALIDATION;
  return err;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectUuid(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw validation(`Campo "${field}" deve ser UUID.`);
  }
  const trimmed = value.trim();
  if (!UUID_RE.test(trimmed)) {
    throw validation(`Campo "${field}" deve ser um UUID válido.`);
  }
  return trimmed;
}

export function parseConversationBroadcastBody(body: unknown): ConversationBroadcastInput {
  if (!isPlainObject(body)) {
    throw validation('Corpo inválido.');
  }

  const rawAudience = body.audience;
  const rawText = body.text;
  const rawStudentIds = body.student_ids ?? body.studentIds;

  if (rawAudience !== 'all' && rawAudience !== 'active' && rawAudience !== 'selected') {
    throw validation('Campo "audience" deve ser "all", "active" ou "selected".');
  }

  if (typeof rawText !== 'string' || rawText.trim().length === 0) {
    throw validation('Campo "text" é obrigatório.');
  }

  let studentIds: string[] = [];
  if (rawAudience === 'selected') {
    if (!Array.isArray(rawStudentIds) || rawStudentIds.length === 0) {
      throw validation('Campo "student_ids" é obrigatório quando audience é "selected".');
    }

    studentIds = rawStudentIds.map((value, index) => expectUuid(value, `student_ids[${index}]`));
    const unique = new Set(studentIds);
    if (unique.size !== studentIds.length) {
      throw validation('Campo "student_ids" não pode conter duplicatas.');
    }
  }

  return {
    text: rawText.trim(),
    audience: rawAudience,
    student_ids: studentIds,
  };
}