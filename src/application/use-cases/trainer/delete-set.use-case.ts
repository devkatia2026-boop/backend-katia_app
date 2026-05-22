import type { ISetsRepository } from '../../ports/sets.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteSetUseCase {
  constructor(private readonly sets: ISetsRepository) {}

  async execute(setId: number): Promise<void> {
    const ok = await this.sets.deleteById(setId);
    if (!ok) {
      const err = new Error('Set não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
