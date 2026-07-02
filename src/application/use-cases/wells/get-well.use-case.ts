import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { IWellsRepository, WellDTO } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class GetWellUseCase {
  constructor(
    private readonly wells: IWellsRepository,
    private readonly wellbeing: IWellbeingRepository
  ) {}

  async execute(wellId: number, role: ContentViewerRole): Promise<WellDTO> {
    const row = await this.wells.findById(wellId);
    if (!row) {
      const err = new Error('Well não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      assertActiveForStudent(row.status, 'Well não encontrado.');
      const parent = await this.wellbeing.findById(row.wellbeing_id);
      if (!parent) {
        const err = new Error('Well não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(parent.status, 'Well não encontrado.');
    }
    return row;
  }
}
