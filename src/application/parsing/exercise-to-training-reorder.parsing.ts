import type { ExerciseToTrainingReorderDirection } from '../ports/exercises-to-trainings.port';

const VALIDATION = 'ValidationException';

function validation(message: string): Error {
  const err = new Error(message);
  err.name = VALIDATION;
  return err;
}

export function parseExerciseToTrainingReorderBody(body: unknown): {
  linkId: number;
  direction: ExerciseToTrainingReorderDirection;
} {
  if (typeof body !== 'object' || body === null) {
    throw validation('Corpo inválido.');
  }

  const record = body as Record<string, unknown>;
  const rawId = record.linkId;
  const rawDirection = record.direction;

  const linkId =
    typeof rawId === 'number'
      ? rawId
      : typeof rawId === 'string'
        ? Number.parseInt(rawId, 10)
        : Number.NaN;

  if (!Number.isInteger(linkId) || linkId < 1) {
    throw validation('linkId inválido.');
  }

  if (rawDirection !== 'up' && rawDirection !== 'down') {
    throw validation('direction deve ser "up" ou "down".');
  }

  return { linkId, direction: rawDirection };
}