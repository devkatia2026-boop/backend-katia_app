import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { parseOptionalPositiveIntQuery } from '../../parsing/content-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IWellsRepository, WellDTO } from '../../ports/wells.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListWellsUseCase {
  constructor(private readonly wells: IWellsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole,
    rawWellbeingId: unknown
  ): Promise<PagedList<WellDTO>> {
    const p = normalizePagination(page, pageSize);
    const wellbeingId = parseOptionalPositiveIntQuery(rawWellbeingId, 'wellbeingId');
    return this.wells.listPaged(p.page, p.pageSize, {
      activeOnly: listActiveOnlyForRole(role),
      wellbeingId,
    });
  }
}
