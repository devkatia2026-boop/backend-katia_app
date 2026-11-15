import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { parseOptionalPositiveIntQuery } from '../../parsing/content-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { ISubjectWellsRepository } from '../../ports/subject-wells.port';
import type { IWellsRepository, WellDTO } from '../../ports/wells.port';
import type { PagedList } from '../../ports/social-feed.port';
import {
  enrichWellsWithSubjects,
  groupSubjectWellsByWellId,
} from '../../wells/enrich-wells-with-subjects';

export class ListWellsUseCase {
  constructor(
    private readonly wells: IWellsRepository,
    private readonly subjectWells: ISubjectWellsRepository
  ) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole,
    rawWellbeingId: unknown
  ): Promise<PagedList<WellDTO>> {
    const p = normalizePagination(page, pageSize);
    const wellbeingId = parseOptionalPositiveIntQuery(rawWellbeingId, 'wellbeingId');
    const result = await this.wells.listPaged(p.page, p.pageSize, {
      activeOnly: listActiveOnlyForRole(role),
      wellbeingId,
    });
    const wellIds = result.items.map((item) => item.id);
    const subjects = await this.subjectWells.findByWellIds(wellIds);
    const grouped = groupSubjectWellsByWellId(subjects);

    return {
      ...result,
      items: enrichWellsWithSubjects(result.items, grouped),
    };
  }
}