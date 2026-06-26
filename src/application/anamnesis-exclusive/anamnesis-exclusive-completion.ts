import type {
  AnamnesisExclusiveCompletionResult,
  AnamnesisExclusiveDTO,
} from '../ports/anamnesis-exclusive.port';
import { isMultiLinkField, isMultiLinkFieldFilled } from './anamnesis-exclusive-response.formatter';

export const ANAMNESIS_EXCLUSIVE_OPTIONAL_FIELDS = [
  'link_food_planning',
  'link_current_workout',
  'link_woman_inspiration',
] as const;

export const ANAMNESIS_EXCLUSIVE_REQUIRED_FIELDS = [
  'full_name',
  'adress',
  'birth',
  'city_country',
  'profession',
  'whatsapp',
  'instagram',
  'indication',
  'link_medical_request',
  'weight',
  'heigth',
  'waist',
  'abdomen',
  'hip',
  'photos_posture',
  'photos_up_leg',
  'photos_up_arms',
  'photos_up_leg_dois',
  'photos_sit',
  'have_a_children',
  'objective',
  'nutritional_monitoring',
  'biggest_challenge',
  'already_training',
  'weekly_training_quantity',
  'time_training',
  'pain',
  'level_trianing',
  'reason',
  'size_shirt',
  'size_leggin',
  'size_top',
  'number_shoe',
] as const;

export const ANAMNESIS_EXCLUSIVE_DATA_FIELDS = [
  ...ANAMNESIS_EXCLUSIVE_REQUIRED_FIELDS,
  ...ANAMNESIS_EXCLUSIVE_OPTIONAL_FIELDS,
] as const;

type RequiredField = (typeof ANAMNESIS_EXCLUSIVE_REQUIRED_FIELDS)[number];

function isFieldFilled(record: AnamnesisExclusiveDTO, field: RequiredField): boolean {
  const value = record[field];
  if (value === null || value === undefined) return false;
  if (isMultiLinkField(field)) {
    return typeof value === 'string' && isMultiLinkFieldFilled(value);
  }
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  return false;
}

export function evaluateAnamnesisExclusiveCompletion(
  studentId: string,
  record: AnamnesisExclusiveDTO | null
): AnamnesisExclusiveCompletionResult {
  if (!record) {
    return {
      student_id: studentId,
      complete: false,
      missing_fields: [...ANAMNESIS_EXCLUSIVE_REQUIRED_FIELDS],
    };
  }
  const missing = ANAMNESIS_EXCLUSIVE_REQUIRED_FIELDS.filter((field) => !isFieldFilled(record, field));
  return {
    student_id: studentId,
    complete: missing.length === 0,
    missing_fields: [...missing],
  };
}
