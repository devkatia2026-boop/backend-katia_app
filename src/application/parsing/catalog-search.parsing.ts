const VALIDATION = 'ValidationException';

export function parseCatalogSearchQuery(q: unknown): string {
  if (typeof q !== 'string' || q.trim().length === 0) {
    const err = new Error('Parâmetro "q" (termo de busca) é obrigatório.');
    err.name = VALIDATION;
    throw err;
  }
  const term = q.trim();
  if (term.length > 200) {
    const err = new Error('Parâmetro "q" deve ter no máximo 200 caracteres.');
    err.name = VALIDATION;
    throw err;
  }
  return term;
}
