import type { RevaluationUpsertValues } from '../ports/revaluations.port';

const VALIDATION = 'ValidationException';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNullableString(value: unknown, field: string): string | null {
  if (value === null) return null;
  if (typeof value !== 'string') {
    const err = new Error(`Campo "${field}" deve ser string ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  const t = value.trim();
  return t.length === 0 ? null : t;
}

function expectNullableNumber(value: unknown, field: string): number | null {
  if (value === null || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const t = value.trim();
    if (t.length === 0) return null;
    const n = parseFloat(t);
    if (Number.isFinite(n)) return n;
  }
  const err = new Error(`Campo "${field}" deve ser número finito ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableInteger(value: unknown, field: string): number | null {
  const n = expectNullableNumber(value, field);
  if (n === null) return null;
  if (!Number.isInteger(n)) {
    const err = new Error(`Campo "${field}" deve ser inteiro ou null.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

function expectNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const t = value.trim().toLowerCase();
    if (t === 'true') return true;
    if (t === 'false') return false;
  }
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

const REVALUATION_FIELDS = [
  'front_photo',
  'side_photo',
  'back_photo',
  'current_weight',
  'monthly_rating',
  'biggest_achievement',
  'biggest_challenge',
  'training_fit_routine',
  'favorite_workout',
  'least_favorite_or_difficult_exercise',
  'nutrition_rating',
  'energy_rating',
  'body_changes',
  'pain_or_adjustments',
  'next_month_goal',
  'proudest_moment',
] as const;

export function parseRevaluationCreateBody(body: unknown): RevaluationUpsertValues {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const out: RevaluationUpsertValues = {};
  if ('front_photo' in body) out.front_photo = expectNullableString(body.front_photo, 'front_photo');
  if ('side_photo' in body) out.side_photo = expectNullableString(body.side_photo, 'side_photo');
  if ('back_photo' in body) out.back_photo = expectNullableString(body.back_photo, 'back_photo');
  if ('current_weight' in body) {
    out.current_weight = expectNullableNumber(body.current_weight, 'current_weight');
  }
  if ('monthly_rating' in body) {
    out.monthly_rating = expectNullableString(body.monthly_rating, 'monthly_rating');
  }
  if ('biggest_achievement' in body) {
    out.biggest_achievement = expectNullableString(body.biggest_achievement, 'biggest_achievement');
  }
  if ('biggest_challenge' in body) {
    out.biggest_challenge = expectNullableString(body.biggest_challenge, 'biggest_challenge');
  }
  if ('training_fit_routine' in body) {
    out.training_fit_routine = expectNullableBoolean(body.training_fit_routine, 'training_fit_routine');
  }
  if ('favorite_workout' in body) {
    out.favorite_workout = expectNullableString(body.favorite_workout, 'favorite_workout');
  }
  if ('least_favorite_or_difficult_exercise' in body) {
    out.least_favorite_or_difficult_exercise = expectNullableString(
      body.least_favorite_or_difficult_exercise,
      'least_favorite_or_difficult_exercise'
    );
  }
  if ('nutrition_rating' in body) {
    out.nutrition_rating = expectNullableString(body.nutrition_rating, 'nutrition_rating');
  }
  if ('energy_rating' in body) {
    out.energy_rating = expectNullableInteger(body.energy_rating, 'energy_rating');
  }
  if ('body_changes' in body) out.body_changes = expectNullableString(body.body_changes, 'body_changes');
  if ('pain_or_adjustments' in body) {
    out.pain_or_adjustments = expectNullableString(body.pain_or_adjustments, 'pain_or_adjustments');
  }
  if ('next_month_goal' in body) {
    out.next_month_goal = expectNullableString(body.next_month_goal, 'next_month_goal');
  }
  if ('proudest_moment' in body) {
    out.proudest_moment = expectNullableString(body.proudest_moment, 'proudest_moment');
  }

  const hasField = REVALUATION_FIELDS.some((field) => field in body);
  if (!hasField) {
    const err = new Error('Informe ao menos um campo da reavaliação.');
    err.name = VALIDATION;
    throw err;
  }

  return out;
}

export function parseRevaluationCompareQuery(
  firstId: unknown,
  secondId: unknown
): { firstId: number; secondId: number } {
  const parseId = (value: unknown, label: string): number => {
    const raw = Array.isArray(value) ? value[0] : value;
    const n = parseInt(String(raw ?? '').trim(), 10);
    if (!Number.isFinite(n) || n < 1) {
      const err = new Error(`Parâmetro "${label}" inválido.`);
      err.name = VALIDATION;
      throw err;
    }
    return n;
  };

  const first = parseId(firstId, 'firstId');
  const second = parseId(secondId, 'secondId');
  if (first === second) {
    const err = new Error('Os parâmetros firstId e secondId devem ser diferentes.');
    err.name = VALIDATION;
    throw err;
  }
  return { firstId: first, secondId: second };
}
