import type { AnamnesisExclusiveUpsertValues } from '../ports/anamnesis-exclusive.port';
import {
  ANAMNESIS_EXCLUSIVE_FILE_FIELDS,
  type AnamnesisExclusiveFileField,
} from '../anamnesis-exclusive/anamnesis-exclusive-file-fields';
import { serializeMultiLinkInput } from '../anamnesis-exclusive/anamnesis-exclusive-response.formatter';

const VALIDATION = 'ValidationException';

const MULTI_LINK_FIELDS = new Set<AnamnesisExclusiveFileField>([
  'photos_posture',
  'photos_up_leg',
  'photos_up_arms',
  'photos_up_leg_dois',
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableString(value: unknown, field: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

function expectNullableNumber(value: unknown, field: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.length === 0) return null;
    const n = Number(t);
    if (Number.isFinite(n)) return n;
  }
  const err = new Error(`Campo "${field}" deve ser número finito ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableInteger(value: unknown, field: string): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.length === 0) return null;
    const n = Number.parseInt(t, 10);
    if (Number.isInteger(n)) return n;
  }
  const err = new Error(`Campo "${field}" deve ser inteiro ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t.length === 0) return null;
    if (t === 'true' || t === '1') return true;
    if (t === 'false' || t === '0') return false;
  }
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableLink(value: unknown, field: string): string | null {
  if (MULTI_LINK_FIELDS.has(field as AnamnesisExclusiveFileField)) {
    return serializeMultiLinkInput(value, field);
  }
  return expectNullableString(value, field);
}

export type ParseAnamnesisExclusiveCreateOptions = {
  skipFileFields?: boolean;
};

export function parseAnamnesisExclusiveCreateBody(
  body: unknown,
  options?: ParseAnamnesisExclusiveCreateOptions
): AnamnesisExclusiveUpsertValues {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const skipFileFields = options?.skipFileFields === true;
  const fileFieldNames = new Set(Object.keys(ANAMNESIS_EXCLUSIVE_FILE_FIELDS));
  const out: AnamnesisExclusiveUpsertValues = {};
  if ('full_name' in body) out.full_name = expectNullableString(body.full_name, 'full_name');
  if ('adress' in body) out.adress = expectNullableString(body.adress, 'adress');
  if ('birth' in body) out.birth = expectNullableString(body.birth, 'birth');
  if ('city_country' in body) out.city_country = expectNullableString(body.city_country, 'city_country');
  if ('profession' in body) out.profession = expectNullableString(body.profession, 'profession');
  if ('whatsapp' in body) out.whatsapp = expectNullableString(body.whatsapp, 'whatsapp');
  if ('instagram' in body) out.instagram = expectNullableString(body.instagram, 'instagram');
  if ('indication' in body) out.indication = expectNullableString(body.indication, 'indication');
  if (!skipFileFields && 'link_medical_request' in body)
    out.link_medical_request = expectNullableLink(body.link_medical_request, 'link_medical_request');
  if ('weight' in body) out.weight = expectNullableNumber(body.weight, 'weight');
  if ('heigth' in body) out.heigth = expectNullableNumber(body.heigth, 'heigth');
  if ('waist' in body) out.waist = expectNullableNumber(body.waist, 'waist');
  if ('abdomen' in body) out.abdomen = expectNullableNumber(body.abdomen, 'abdomen');
  if ('hip' in body) out.hip = expectNullableNumber(body.hip, 'hip');
  if (!skipFileFields && 'photos_posture' in body)
    out.photos_posture = expectNullableLink(body.photos_posture, 'photos_posture');
  if (!skipFileFields && 'photos_up_leg' in body)
    out.photos_up_leg = expectNullableLink(body.photos_up_leg, 'photos_up_leg');
  if (!skipFileFields && 'photos_up_arms' in body)
    out.photos_up_arms = expectNullableLink(body.photos_up_arms, 'photos_up_arms');
  if (!skipFileFields && 'photos_up_leg_dois' in body)
    out.photos_up_leg_dois = expectNullableLink(body.photos_up_leg_dois, 'photos_up_leg_dois');
  if (!skipFileFields && 'photos_sit' in body)
    out.photos_sit = expectNullableLink(body.photos_sit, 'photos_sit');
  if ('have_a_children' in body)
    out.have_a_children = expectNullableBoolean(body.have_a_children, 'have_a_children');
  if ('objective' in body) out.objective = expectNullableString(body.objective, 'objective');
  if ('nutritional_monitoring' in body)
    out.nutritional_monitoring = expectNullableString(body.nutritional_monitoring, 'nutritional_monitoring');
  if (!skipFileFields && 'link_food_planning' in body)
    out.link_food_planning = expectNullableLink(body.link_food_planning, 'link_food_planning');
  if ('biggest_challenge' in body)
    out.biggest_challenge = expectNullableString(body.biggest_challenge, 'biggest_challenge');
  if ('already_training' in body)
    out.already_training = expectNullableString(body.already_training, 'already_training');
  if ('weekly_training_quantity' in body)
    out.weekly_training_quantity = expectNullableInteger(
      body.weekly_training_quantity,
      'weekly_training_quantity'
    );
  if ('time_training' in body) out.time_training = expectNullableInteger(body.time_training, 'time_training');
  if ('pain' in body) out.pain = expectNullableString(body.pain, 'pain');
  if (!skipFileFields && 'link_current_workout' in body)
    out.link_current_workout = expectNullableLink(body.link_current_workout, 'link_current_workout');
  if ('level_trianing' in body)
    out.level_trianing = expectNullableInteger(body.level_trianing, 'level_trianing');
  if (!skipFileFields && 'link_woman_inspiration' in body)
    out.link_woman_inspiration = expectNullableLink(body.link_woman_inspiration, 'link_woman_inspiration');
  if ('reason' in body) out.reason = expectNullableString(body.reason, 'reason');
  if ('size_shirt' in body) out.size_shirt = expectNullableString(body.size_shirt, 'size_shirt');
  if ('size_leggin' in body) out.size_leggin = expectNullableString(body.size_leggin, 'size_leggin');
  if ('size_top' in body) out.size_top = expectNullableString(body.size_top, 'size_top');
  if ('number_shoe' in body) out.number_shoe = expectNullableInteger(body.number_shoe, 'number_shoe');

  if (skipFileFields) {
    for (const key of Object.keys(out)) {
      if (fileFieldNames.has(key)) delete out[key as keyof AnamnesisExclusiveUpsertValues];
    }
  }

  return out;
}
