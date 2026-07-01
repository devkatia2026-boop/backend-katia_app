const VALIDATION = 'ValidationException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function parseOptionalProgramSearch(raw: unknown): string | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  if (typeof raw !== 'string') {
    const err = new Error('Parâmetro "search" deve ser string.');
    err.name = VALIDATION;
    throw err;
  }
  const term = raw.trim();
  if (term.length === 0) return undefined;
  if (term.length > 200) {
    const err = new Error('Parâmetro "search" deve ter no máximo 200 caracteres.');
    err.name = VALIDATION;
    throw err;
  }
  return term;
}

export function firstProgramSearchQuery(query: Record<string, unknown>): unknown {
  return firstQuery(query.search);
}
