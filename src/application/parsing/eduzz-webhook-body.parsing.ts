export type ParsedEduzzWebhookBody = {
  event: string;
  buyerEmail: string;
  producerName: string;
  originSecret: string | null;
};

export function readEduzzWebhookEvent(body: unknown): string | null {
  if (typeof body !== 'object' || body === null) {
    return null;
  }

  const event = (body as Record<string, unknown>).event;
  if (typeof event !== 'string' || event.trim().length === 0) {
    return null;
  }

  return event.trim();
}

export function isEduzzConnectivityEvent(event: string): boolean {
  const normalized = event.trim().toLowerCase();
  return normalized === 'ping' || normalized.startsWith('test.');
}

export function parseEduzzWebhookBody(body: unknown): ParsedEduzzWebhookBody {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Corpo da requisição inválido.');
  }

  const record = body as Record<string, unknown>;
  const event = readRequiredString(record.event, 'event');
  const data = readRequiredObject(record.data, 'data');
  const buyer = readRequiredObject(data.buyer, 'data.buyer');
  const producer = readRequiredObject(data.producer, 'data.producer');
  const buyerEmail = readRequiredString(buyer.email, 'data.buyer.email');
  const producerName = readRequiredString(producer.name, 'data.producer.name');
  const originSecret =
    typeof producer.originSecret === 'string' ? producer.originSecret.trim() : null;

  return {
    event,
    buyerEmail,
    producerName,
    originSecret,
  };
}

function readRequiredObject(value: unknown, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Campo ${field} inválido.`);
  }
  return value as Record<string, unknown>;
}

function readRequiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Campo ${field} inválido.`);
  }
  return value.trim();
}
