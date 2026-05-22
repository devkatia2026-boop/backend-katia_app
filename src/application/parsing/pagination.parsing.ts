export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

export function normalizePagination(
  page: unknown,
  pageSize: unknown
): { page: number; pageSize: number } {
  let p: number;
  if (typeof page === 'string') {
    p = parseInt(page, 10);
  } else if (typeof page === 'number') {
    p = page;
  } else {
    p = 1;
  }

  let ps: number;
  if (typeof pageSize === 'string') {
    ps = parseInt(pageSize, 10);
  } else if (typeof pageSize === 'number') {
    ps = pageSize;
  } else {
    ps = DEFAULT_PAGE_SIZE;
  }

  if (!Number.isFinite(p) || p < 1) p = 1;
  if (!Number.isFinite(ps) || ps < 1) ps = DEFAULT_PAGE_SIZE;
  if (ps > MAX_PAGE_SIZE) ps = MAX_PAGE_SIZE;

  return { page: p, pageSize: ps };
}
