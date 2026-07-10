const VALIDATION = 'ValidationException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

export type TrainerStudentValidationFilter = 'sim' | 'nao';

export function parseTrainerStudentValidation(raw: unknown): TrainerStudentValidationFilter {
  if (typeof raw !== 'string') {
    const err = new Error('Parâmetro "validation" deve ser "sim" ou "nao".');
    err.name = VALIDATION;
    throw err;
  }
  const normalized = raw.trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
  if (normalized === 'sim') return 'sim';
  if (normalized === 'nao') return 'nao';
  const err = new Error('Parâmetro "validation" deve ser "sim" ou "nao".');
  err.name = VALIDATION;
  throw err;
}

export function parseOptionalTrainerStudentValidation(
  raw: unknown
): TrainerStudentValidationFilter | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  return parseTrainerStudentValidation(raw);
}

export function firstTrainerStudentValidationQuery(
  query: Record<string, unknown>
): unknown {
  return firstQuery(query.validation);
}
