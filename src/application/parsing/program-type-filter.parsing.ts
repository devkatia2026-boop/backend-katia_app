import type { ProgramTypeFilter } from '../ports/programs.port';

const VALIDATION = 'ValidationException';

function normalizeTypeToken(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function parseOptionalProgramTypeFilter(raw: unknown): ProgramTypeFilter | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string') {
    const err = new Error('Parâmetro "type" deve ser "Casa", "Academia" ou "Casa/Academia".');
    err.name = VALIDATION;
    throw err;
  }
  const normalized = normalizeTypeToken(raw);
  if (normalized === 'casa') return 'casa';
  if (normalized === 'academia') return 'academia';
  if (normalized === 'ambos' || normalized === 'casa/academia') return 'ambos';
  const err = new Error('Parâmetro "type" deve ser "Casa", "Academia" ou "Casa/Academia".');
  err.name = VALIDATION;
  throw err;
}
