export function parseTrainingOrderIds(raw: string | null | undefined): number[] {
  if (!raw?.trim()) {
    return [];
  }

  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number.parseInt(part, 10))
    .filter((value) => Number.isFinite(value) && value >= 1);
}

export function sortByTrainingOrderIds<T>(
  items: readonly T[],
  getId: (item: T) => number,
  orderRaw: string | null | undefined,
): T[] {
  const orderIds = parseTrainingOrderIds(orderRaw);

  if (orderIds.length === 0 || items.length === 0) {
    return [...items];
  }

  const byId = new Map(items.map((item) => [getId(item), item]));
  const ordered: T[] = [];

  for (const id of orderIds) {
    const item = byId.get(id);

    if (item) {
      ordered.push(item);
      byId.delete(id);
    }
  }

  for (const item of items) {
    if (byId.has(getId(item))) {
      ordered.push(item);
    }
  }

  return ordered;
}
