import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalProgramSearch } from '../../parsing/program-search.parsing';

export class ListProgramsUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  execute(page: unknown, pageSize: unknown, rawSearch: unknown): Promise<PagedList<ProgramDTO>> {
    const p = normalizePagination(page, pageSize);
    const search = parseOptionalProgramSearch(rawSearch);
    return this.programs.listPaged(p.page, p.pageSize, search);
  }
}
