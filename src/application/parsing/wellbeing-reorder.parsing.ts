import type { WellbeingReorderDirection } from '../ports/wellbeing.port';

const VALIDATION = 'ValidationException';

function validation(message: string): Error {
  const err = new Error(message);
  err.name = VALIDATION;
  return err;
}

export function parseWellbeingReorderBody(body: unknown): {
  wellbeingId: number;
  direction: WellbeingReorderDirection;
} {
  if (typeof body !== 'object' || body === null) {
    throw validation('Corpo inválido.');
  }

  const record = body as Record<string, unknown>;
  const rawId = record.wellbeingId;
  const rawDirection = record.direction;

  const wellbeingId =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string'
        ? Number.parseInt(rawId, 10)
        : Number.NaN;

  if (!Number.isInteger(wellbeingId) || wellbeingId < 1) {
    throw validation('wellbeingId inválido.');
  }

  if (rawDirection !== 'up' && rawDirection !== 'down') {
    throw validation('direction deve ser "up" ou "down".');
  }

  return { wellbeingId, direction: rawDirection };
}