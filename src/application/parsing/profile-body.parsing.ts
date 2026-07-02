import type {
  StudentProfileUpdateValues,
  TrainerProfileUpdateValues,
} from '../ports/user-profile-updater.port';

const VALIDATION = 'ValidationException';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function expectNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    const err = new Error(`Campo "${field}" deve ser uma string não vazia.`);
    err.name = VALIDATION;
    throw err;
  }
  return value.trim();
}

function expectEmail(value: unknown, field: string): string {
  const s = expectNonEmptyString(value, field);
  if (!EMAIL_RE.test(s)) {
    const err = new Error(`Campo "${field}" deve ser um e-mail válido.`);
    err.name = VALIDATION;
    throw err;
  }
  return s;
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
  if (value === null) return null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const err = new Error(`Campo "${field}" deve ser número finito ou null.`);
  err.name = VALIDATION;
  throw err;
}

function expectNullableBoolean(value: unknown, field: string): boolean | null {
  if (value === null) return null;
  if (typeof value === 'boolean') return value;
  const err = new Error(`Campo "${field}" deve ser boolean ou null.`);
  err.name = VALIDATION;
  throw err;
}

/**
 * Campos comuns + exclusivos de aluno (mesma regra do PATCH /auth/me para student).
 */
export function parseMyProfileBody(body: unknown): {
  common: TrainerProfileUpdateValues;
  studentExtra: StudentProfileUpdateValues;
} {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }

  const common: TrainerProfileUpdateValues = {};
  const studentExtra: StudentProfileUpdateValues = {};

  if ('name' in body) {
    common.full_name = expectNonEmptyString(body.name, 'name');
  }
  if ('photo_perfil' in body) {
    common.photo_perfil = expectNullableString(body.photo_perfil, 'photo_perfil');
  }
  if ('phone' in body) {
    common.phone = expectNullableString(body.phone, 'phone');
  }
  if ('email' in body) {
    common.email = expectEmail(body.email, 'email');
  }
  if ('expo_push_token' in body) {
    common.expo_push_token = expectNullableString(body.expo_push_token, 'expo_push_token');
  }
  if ('check_winner' in body) {
    common.check_winner = expectNullableBoolean(body.check_winner, 'check_winner');
  }
  if ('birth' in body) {
    studentExtra.birth = expectNullableString(body.birth, 'birth');
  }
  if ('cpf' in body) {
    studentExtra.cpf = expectNullableString(body.cpf, 'cpf');
  }
  if ('type_plan' in body) {
    studentExtra.type_plan = expectNullableString(body.type_plan, 'type_plan');
  }
  if ('height' in body) {
    studentExtra.height = expectNullableNumber(body.height, 'height');
  }
  if ('weight' in body) {
    studentExtra.weight = expectNullableNumber(body.weight, 'weight');
  }

  return { common, studentExtra };
}

/** Payload parcial de aluno (treinador editando aluna ou aluna editando o próprio perfil). */
export function parseStudentProfileUpdateBody(body: unknown): StudentProfileUpdateValues {
  const { common, studentExtra } = parseMyProfileBody(body);
  return { ...common, ...studentExtra };
}
