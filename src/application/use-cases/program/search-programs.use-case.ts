import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { parseCatalogSearchQuery } from '../../parsing/catalog-search.parsing';
import { parseOptionalProgramTypeFilter } from '../../parsing/program-type-filter.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IProgramsRepository, ProgramPagedList } from '../../ports/programs.port';

export class SearchProgramsUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  execute(
    q: unknown,
    page: unknown,
    pageSize: unknown,
    rawType: unknown,
    role: ContentViewerRole
  ): Promise<ProgramPagedList> {
    const search = parseCatalogSearchQuery(q);
    const p = normalizePagination(page, pageSize);
    const type = parseOptionalProgramTypeFilter(rawType);
    return this.programs.listPaged(p.page, p.pageSize, {
      search,
      type,
      activeOnly: listActiveOnlyForRole(role),
    });
  }
}
