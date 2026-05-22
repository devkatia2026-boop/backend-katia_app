import type { ISetsRepository, SetDTO } from '../../ports/sets.port';

const NOT_FOUND = 'NotFoundException';

export class GetSetUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  async execute(setId: number): Promise<SetDTO> {
    const row = await this.sets.findById(setId);
    if (!row) {
      const err = new Error('Set não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
