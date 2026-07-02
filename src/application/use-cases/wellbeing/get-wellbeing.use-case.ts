import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { IWellbeingRepository, WellbeingDTO } from '../../ports/wellbeing.port';

const NOT_FOUND = 'NotFoundException';

export class GetWellbeingUseCase {
  constructor(private readonly wellbeing: IWellbeingRepository) {}

  async execute(wellbeingId: number, role: ContentViewerRole): Promise<WellbeingDTO> {
    const row = await this.wellbeing.findById(wellbeingId);
    if (!row) {
      const err = new Error('Wellbeing não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      assertActiveForStudent(row.status, 'Wellbeing não encontrado.');
    }
    return row;
  }
}
