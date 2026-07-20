import { parseOptionalUuid } from './program-to-student-body.parsing';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseStartRevaluationBody(body: unknown): { studentIds?: string[] } {
  if (body === undefined || body === null) return {};
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const raw = body.student_ids ?? body.studentIds;
  if (raw === undefined || raw === null) return {};
  if (!Array.isArray(raw)) {
    const err = new Error('Campo "student_ids" deve ser um array de UUIDs.');
    err.name = VALIDATION;
    throw err;
  }
  if (raw.length === 0) return {};

  const studentIds: string[] = [];
  for (let i = 0; i < raw.length; i++) {
    const id = parseOptionalUuid(raw[i], `student_ids[${i}]`);
    if (id === undefined) {
      const err = new Error(`Campo "student_ids[${i}]" deve ser um UUID válido.`);
      err.name = VALIDATION;
      throw err;
    }
    studentIds.push(id);
  }

  return { studentIds };
}
