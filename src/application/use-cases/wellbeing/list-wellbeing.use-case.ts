import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IWellbeingRepository, WellbeingDTO } from '../../ports/wellbeing.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListWellbeingUseCase {
  constructor(private readonly wellbeing: IWellbeingRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole
  ): Promise<PagedList<WellbeingDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.wellbeing.listPaged(p.page, p.pageSize, {
      activeOnly: listActiveOnlyForRole(role),
    });
  }
}
