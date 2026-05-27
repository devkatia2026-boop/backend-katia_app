/** Formato visual BR: `(11) 99999-9999` ou fixo `(11) 3456-7890`. Espaços após ) são opcionais. */
const BR_DISPLAY_PHONE_RE = /^\(\d{2}\)\s*\d{4,5}-\d{4}$/;

const VALIDATION = 'ValidationException';

/** Telefone opcional para registro; apenas valida forma — gravado só na base pelo use case. */
export function parseOptionalBrazilDisplayPhone(raw: unknown): string | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw !== 'string') {
    const err = new Error('Campo "phone" deve ser string quando informado.');
    err.name = VALIDATION;
    throw err;
  }
  const t = raw.trim();
  if (t.length === 0) return null;
  if (!BR_DISPLAY_PHONE_RE.test(t)) {
    const err = new Error(
      'Campo "phone" deve estar no formato (DDD) número, ex.: (11) 99999-9999 ou (11) 3456-7890.'
    );
    err.name = VALIDATION;
    throw err;
  }
  return t;
}
