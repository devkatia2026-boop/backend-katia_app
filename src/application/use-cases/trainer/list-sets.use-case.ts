import type { ISetsRepository, SetDTO } from '../../ports/sets.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListSetsUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<SetDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.sets.listPaged(p.page, p.pageSize);
  }
}
