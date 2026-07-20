import { col, fn, Op, where, type WhereOptions } from 'sequelize';
import {
  COMUM_TYPE_PLAN_VALUES,
  EXCLUSIVE_TYPE_PLAN_VALUES,
} from '../../application/student-plan/student-type-plan';
import type { NoticeAudiencePlan } from '../../application/ports/notices.port';

function normalizedTypePlanIn(values: readonly string[]): WhereOptions {
  return where(fn('lower', fn('trim', col('type_plan'))), {
    [Op.in]: [...values],
  });
}

export function exclusivePlanWhere(): WhereOptions {
  return normalizedTypePlanIn(EXCLUSIVE_TYPE_PLAN_VALUES);
}

export function comumPlanWhere(): WhereOptions {
  return normalizedTypePlanIn(COMUM_TYPE_PLAN_VALUES);
}

export function noticeAudiencePlanWhere(audience: NoticeAudiencePlan): WhereOptions | null {
  if (audience === 'exclusive') return exclusivePlanWhere();
  if (audience === 'comum') return comumPlanWhere();
  return null;
}
