const VALIDATION = 'ValidationException';

export type StudentPlanRankingType = 'comum' | 'exclusive';

const PLAN_LABELS: Record<StudentPlanRankingType, string> = {
  comum: 'comum',
  exclusive: 'exclusive',
};

export function parseStudentPlanRankingType(raw: string): StudentPlanRankingType {
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'comum' || normalized === 'exclusive') {
    return normalized;
  }
  const err = new Error('Tipo de plano inválido. Use "comum" ou "exclusive".');
  err.name = VALIDATION;
  throw err;
}

export function studentPlanRankingLabel(plan: StudentPlanRankingType): string {
  return PLAN_LABELS[plan];
}

export const RANKING_POINTS_PER_TRAINING = 10;
