import { parseWellCreateBody } from '../../parsing/well-body.parsing';
import type { IWellbeingRepository } from '../../ports/wellbeing.port';
import type { IWellsRepository, WellDTO } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class CreateWellUseCase {
  constructor(
    private readonly wells: IWellsRepository,
    private readonly wellbeing: IWellbeingRepository
  ) {}

  async execute(body: unknown): Promise<WellDTO> {
    const input = parseWellCreateBody(body);
    const parent = await this.wellbeing.findById(input.wellbeing_id);
    if (!parent) {
      const err = new Error('Wellbeing não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.wells.create(input);
  }
}
