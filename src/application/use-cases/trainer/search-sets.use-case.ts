import type { ISetsRepository } from '../../ports/sets.port';
import { parseCatalogSearchQuery } from '../../parsing/catalog-search.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class SearchSetsUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  execute(q: unknown, page: unknown, pageSize: unknown) {
    const term = parseCatalogSearchQuery(q);
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    return this.sets.searchByNamePaged(term, p, ps);
  }
}
