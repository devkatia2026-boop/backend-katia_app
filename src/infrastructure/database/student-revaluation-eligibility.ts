import { col, fn, Op, where, type WhereOptions } from 'sequelize';
import { exclusivePlanWhere } from './student-plan-eligibility';

export function validationSimWhere(): WhereOptions {
  return where(fn('lower', col('validation')), 'sim');
}

export function exclusiveValidatedSimWhere(): WhereOptions {
  return {
    [Op.and]: [exclusivePlanWhere(), validationSimWhere()],
  };
}

export function revaluationPendingDailyReminderWhere(): WhereOptions {
  return {
    [Op.and]: [exclusiveValidatedSimWhere(), { in_revalution: true }],
  };
}
