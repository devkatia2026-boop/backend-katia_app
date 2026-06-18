export type AnamnesisExclusiveFileField =
  | 'link_medical_request'
  | 'photos_posture'
  | 'photos_up_leg'
  | 'photos_up_arms'
  | 'photos_up_leg_dois'
  | 'photos_sit'
  | 'link_food_planning'
  | 'link_current_workout'
  | 'link_woman_inspiration';

export type AnamnesisExclusiveFileFieldConfig = {
  maxCount: number;
  multiple: boolean;
};

export const ANAMNESIS_EXCLUSIVE_FILE_FIELDS: Record<
  AnamnesisExclusiveFileField,
  AnamnesisExclusiveFileFieldConfig
> = {
  link_medical_request: { maxCount: 1, multiple: false },
  photos_posture: { maxCount: 3, multiple: true },
  photos_up_leg: { maxCount: 2, multiple: true },
  photos_up_arms: { maxCount: 2, multiple: true },
  photos_up_leg_dois: { maxCount: 2, multiple: true },
  photos_sit: { maxCount: 1, multiple: false },
  link_food_planning: { maxCount: 1, multiple: false },
  link_current_workout: { maxCount: 1, multiple: false },
  link_woman_inspiration: { maxCount: 1, multiple: false },
};

export const ANAMNESIS_EXCLUSIVE_MULTI_LINK_FIELDS = [
  'photos_posture',
  'photos_up_leg',
  'photos_up_arms',
  'photos_up_leg_dois',
] as const;

export type AnamnesisExclusiveMultiLinkField = (typeof ANAMNESIS_EXCLUSIVE_MULTI_LINK_FIELDS)[number];

export const ANAMNESIS_EXCLUSIVE_MAX_FILE_BYTES = 15 * 1024 * 1024;

export const ANAMNESIS_EXCLUSIVE_MAX_FILES = Object.values(ANAMNESIS_EXCLUSIVE_FILE_FIELDS).reduce(
  (sum, field) => sum + field.maxCount,
  0
);
