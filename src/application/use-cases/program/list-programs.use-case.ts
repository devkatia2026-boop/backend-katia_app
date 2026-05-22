import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListProgramsUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<ProgramDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.programs.listPaged(p.page, p.pageSize);
  }
}
