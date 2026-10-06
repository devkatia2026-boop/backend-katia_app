import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalMethodProgramIdQuery } from '../../parsing/method-body.parsing';
import type { IMethodsRepository, MethodDTO } from '../../ports/methods.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListMethodsUseCase {
  constructor(private readonly repo: IMethodsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawMethodProgramId?: unknown
  ): Promise<PagedList<MethodDTO>> {
    const p = normalizePagination(page, pageSize);
    const methodProgramId = parseOptionalMethodProgramIdQuery(rawMethodProgramId);
    return this.repo.listPaged(
      p.page,
      p.pageSize,
      methodProgramId !== undefined ? { methodProgramId } : undefined
    );
  }
}
