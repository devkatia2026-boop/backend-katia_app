const VALIDATION = 'ValidationException';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectUuid(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser UUID (string).`);
    err.name = VALIDATION;
    throw err;
  }
  const trimmed = value.trim();
  if (!UUID_RE.test(trimmed)) {
    const err = new Error(`Campo "${field}" deve ser um UUID válido.`);
    err.name = VALIDATION;
    throw err;
  }
  return trimmed;
}

export type CopyStudentTrainingPhasesInput = {
  sourceStudentId: string;
};

export function parseCopyStudentTrainingPhasesBody(body: unknown): CopyStudentTrainingPhasesInput {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição inválido.');
    err.name = VALIDATION;
    throw err;
  }

  return {
    sourceStudentId: expectUuid(body.sourceStudentId, 'sourceStudentId'),
  };
}
