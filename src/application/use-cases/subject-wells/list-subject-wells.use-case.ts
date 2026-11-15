import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import { parseOptionalWellIdQuery } from '../../parsing/subject-well-body.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { ISubjectWellsRepository, SubjectWellDTO } from '../../ports/subject-wells.port';
import type { IWellsRepository } from '../../ports/wells.port';
import type { PagedList } from '../../ports/social-feed.port';

const NOT_FOUND = 'NotFoundException';

export class ListSubjectWellsUseCase {
  constructor(
    private readonly subjectWells: ISubjectWellsRepository,
    private readonly wells: IWellsRepository,
    private readonly wellbeing: IWellbeingRepository
  ) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole,
    rawWellId: unknown
  ): Promise<PagedList<SubjectWellDTO>> {
    const p = normalizePagination(page, pageSize);
    const wellId = parseOptionalWellIdQuery(rawWellId);

    if (role === 'student' && wellId !== undefined) {
      const well = await this.wells.findById(wellId);
      if (!well) {
        const err = new Error('Well não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(well.status, 'Well não encontrado.');
      const parent = await this.wellbeing.findById(well.wellbeing_id);
      if (!parent) {
        const err = new Error('Well não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(parent.status, 'Well não encontrado.');
    }

    return this.subjectWells.listPaged(p.page, p.pageSize, { wellId });
  }
}