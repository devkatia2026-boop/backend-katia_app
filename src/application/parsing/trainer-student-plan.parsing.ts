const VALIDATION = 'ValidationException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

export type TrainerStudentPlanFilter = 'exclusive' | 'comum';

export function parseTrainerStudentPlan(raw: unknown): TrainerStudentPlanFilter {
  if (typeof raw !== 'string') {
    const err = new Error('Parâmetro "plan" deve ser "exclusive" ou "comum".');
    err.name = VALIDATION;
    throw err;
  }

  const normalized = raw.trim().toLowerCase();
  if (normalized === 'exclusive') return 'exclusive';
  if (normalized === 'comum') return 'comum';

  const err = new Error('Parâmetro "plan" deve ser "exclusive" ou "comum".');
  err.name = VALIDATION;
  throw err;
}

export function parseOptionalTrainerStudentPlan(
  raw: unknown
): TrainerStudentPlanFilter | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  return parseTrainerStudentPlan(raw);
}

export function firstTrainerStudentPlanQuery(query: Record<string, unknown>): unknown {
  return firstQuery(query.plan);
}
