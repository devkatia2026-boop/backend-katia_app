import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteProgramUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  async execute(programId: number): Promise<void> {
    const ok = await this.programs.deleteById(programId);
    if (!ok) {
      const err = new Error('Programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
