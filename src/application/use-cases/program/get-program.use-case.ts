import type { ProgramDTO } from '../../ports/programs.port';
import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class GetProgramUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  async execute(programId: number): Promise<ProgramDTO> {
    const row = await this.programs.findById(programId);
    if (!row) {
      const err = new Error('Programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
