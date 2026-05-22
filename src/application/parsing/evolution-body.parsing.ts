import type { EvolutionUpsertValues } from '../ports/student-evolutions.port';

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

/** PATCH: ao menos uma chave deve vir no corpo (valores opcionais podem ser null). */
export function parseEvolutionPatchBody(body: unknown): EvolutionUpsertValues {
  if (!isPlainObject(body)) {
    const err = new Error('Corpo da requisição deve ser um objeto JSON.');
    err.name = VALIDATION;
    throw err;
  }
  const out: EvolutionUpsertValues = {};
  if ('original_photo' in body) out.original_photo = expectNullableString(body.original_photo, 'original_photo');
  if ('current_photo' in body) out.current_photo = expectNullableString(body.current_photo, 'current_photo');

  const keysCount = ['original_photo', 'current_photo'].filter((k) => k in body).length;
  if (keysCount === 0) {
    const err = new Error('Envie ao menos um campo: original_photo ou current_photo.');
    err.name = VALIDATION;
    throw err;
  }
  return out;
}

/** POST: ao menos uma imagem deve ser informada após trim (URL/base64/long string). */
export function parseEvolutionCreateBody(body: unknown): EvolutionUpsertValues {
  const parsed = parseEvolutionPatchBody(body);
  const hasPhoto = parsed.original_photo != null || parsed.current_photo != null;
  if (!hasPhoto) {
    const err = new Error('Informe ao menos uma imagem em original_photo ou current_photo.');
    err.name = VALIDATION;
    throw err;
  }
  return parsed;
}
