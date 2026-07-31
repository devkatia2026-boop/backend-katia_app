function sanitizeValueForLog(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValueForLog(item));
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  const record = value as Record<string, unknown>;
  const sanitized: Record<string, unknown> = {};

  for (const [key, nested] of Object.entries(record)) {
    if (key === 'originSecret') {
      sanitized[key] = '[redacted]';
      continue;
    }
    sanitized[key] = sanitizeValueForLog(nested);
  }

  return sanitized;
}

export function formatEduzzWebhookBodyForLog(body: unknown): string {
  try {
    return JSON.stringify(sanitizeValueForLog(body));
  } catch {
    return String(body);
  }
}
