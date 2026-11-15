import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { ISubjectWellsRepository, SubjectWellDTO } from '../../ports/subject-wells.port';
import type { IWellsRepository } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class GetSubjectWellUseCase {
  constructor(
    private readonly subjectWells: ISubjectWellsRepository,
    private readonly wells: IWellsRepository,
    private readonly wellbeing: IWellbeingRepository
  ) {}

  async execute(subjectWellId: number, role: ContentViewerRole): Promise<SubjectWellDTO> {
    const row = await this.subjectWells.findById(subjectWellId);
    if (!row) {
      const err = new Error('Mídia do conteúdo não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    if (role === 'student') {
      const well = await this.wells.findById(row.well_id);
      if (!well) {
        const err = new Error('Mídia do conteúdo não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(well.status, 'Mídia do conteúdo não encontrada.');
      const parent = await this.wellbeing.findById(well.wellbeing_id);
      if (!parent) {
        const err = new Error('Mídia do conteúdo não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(parent.status, 'Mídia do conteúdo não encontrada.');
    }

    return row;
  }
}