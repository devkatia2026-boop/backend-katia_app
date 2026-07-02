import { parseWellPatchBody } from '../../parsing/well-body.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { IWellsRepository, WellDTO } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateWellUseCase {
  constructor(
    private readonly wells: IWellsRepository,
    private readonly wellbeing: IWellbeingRepository
  ) {}

  async execute(wellId: number, body: unknown): Promise<WellDTO> {
    const patch = parseWellPatchBody(body);
    if (patch.wellbeing_id !== undefined) {
      const parent = await this.wellbeing.findById(patch.wellbeing_id);
      if (!parent) {
        const err = new Error('Wellbeing não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }
    return this.wells.update(wellId, patch);
  }
}
