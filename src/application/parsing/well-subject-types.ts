const VALID_TYPES = new Set(['foto', 'video_link', 'video', 'pdf']);

export function normalizeWellSubjectType(value: string): string {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'photo') {
    return 'foto';
  }

  if (!VALID_TYPES.has(normalized)) {
    const err = new Error('Campo "type" deve ser "foto", "video_link", "video" ou "pdf".');
    err.name = 'ValidationException';
    throw err;
  }

  return normalized;
}