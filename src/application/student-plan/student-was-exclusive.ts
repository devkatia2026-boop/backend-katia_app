import type { StudentProfileUpdateValues } from '../ports/user-profile-updater.port';
import { normalizeStudentTypePlan } from './student-type-plan';

export function applyWasExclusiveOnStudentProfileUpdate(
  values: StudentProfileUpdateValues
): StudentProfileUpdateValues {
  if (!('type_plan' in values)) {
    return values;
  }
  if (normalizeStudentTypePlan(values.type_plan) !== 'exclusive') {
    return values;
  }
  return { ...values, was_exclusive: true };
}
