import type { IExercisesToProgramsRepository } from '../../ports/exercises-to-programs.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteExerciseToProgramUseCase {
  constructor(private readonly repo: IExercisesToProgramsRepository) {}

  async execute(id: number): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Vínculo exercício↔programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
