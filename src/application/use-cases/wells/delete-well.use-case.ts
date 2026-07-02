import type { IWellsRepository } from '../../ports/wells.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteWellUseCase {
  constructor(private readonly wells: IWellsRepository) {}

  async execute(wellId: number): Promise<void> {
    const deleted = await this.wells.deleteById(wellId);
    if (!deleted) {
      const err = new Error('Well não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
