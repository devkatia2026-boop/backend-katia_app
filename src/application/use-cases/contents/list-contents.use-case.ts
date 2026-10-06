import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { parseOptionalIntroductionIdQuery } from '../../parsing/contents-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { ContentDTO, IContentsRepository } from '../../ports/contents.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListContentsUseCase {
  constructor(private readonly contents: IContentsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole,
    rawIntroductionId: unknown
  ): Promise<PagedList<ContentDTO>> {
    const p = normalizePagination(page, pageSize);
    const introductionId = parseOptionalIntroductionIdQuery(rawIntroductionId);
    return this.contents.listPaged(p.page, p.pageSize, {
      introductionId,
      activeProgramOnly: listActiveOnlyForRole(role),
    });
  }
}
