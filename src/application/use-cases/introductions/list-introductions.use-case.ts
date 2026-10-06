import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { parseOptionalProgramIdQuery } from '../../parsing/introduction-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IIntroductionsRepository, IntroductionDTO } from '../../ports/introductions.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListIntroductionsUseCase {
  constructor(private readonly introductions: IIntroductionsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole,
    rawProgramId: unknown
  ): Promise<PagedList<IntroductionDTO>> {
    const p = normalizePagination(page, pageSize);
    const programId = parseOptionalProgramIdQuery(rawProgramId);
    return this.introductions.listPaged(p.page, p.pageSize, {
      programId,
      activeProgramOnly: listActiveOnlyForRole(role),
    });
  }
}
