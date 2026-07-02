import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { IWellsRepository } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export class DeleteWellbeingUseCase {
  constructor(
    private readonly wellbeing: IWellbeingRepository,
    private readonly wells: IWellsRepository
  ) {}

  async execute(wellbeingId: number): Promise<void> {
    const row = await this.wellbeing.findById(wellbeingId);
    if (!row) {
      const err = new Error('Wellbeing não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const linked = await this.wells.countByWellbeingId(wellbeingId);
    if (linked > 0) {
      const err = new Error('Exclua os wells vinculados antes de excluir o wellbeing.');
      err.name = VALIDATION;
      throw err;
    }
    await this.wellbeing.deleteById(wellbeingId);
  }
}
