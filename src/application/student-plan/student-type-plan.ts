import type { NoticeAudiencePlan } from '../ports/notices.port';

export const EXCLUSIVE_TYPE_PLAN_VALUES = ['exclusive', 'consultoria-exclusiva'] as const;
export const COMUM_TYPE_PLAN_VALUES = ['comum', 'plano-academia'] as const;

export type StudentPlanCategory = 'exclusive' | 'comum';

export function normalizeStudentTypePlan(
  raw: string | null | undefined
): StudentPlanCategory | null {
  const normalized = raw?.trim().toLowerCase() ?? '';

  if (!normalized) {
    return null;
  }

  if ((EXCLUSIVE_TYPE_PLAN_VALUES as readonly string[]).includes(normalized)) {
    return 'exclusive';
  }

  if ((COMUM_TYPE_PLAN_VALUES as readonly string[]).includes(normalized)) {
    return 'comum';
  }

  return null;
}

export function studentMatchesNoticeAudience(
  typePlan: string | null | undefined,
  audience: NoticeAudiencePlan
): boolean {
  if (audience === 'ambos') {
    return true;
  }

  return normalizeStudentTypePlan(typePlan) === audience;
}
