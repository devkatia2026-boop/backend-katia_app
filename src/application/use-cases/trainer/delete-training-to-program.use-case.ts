import type { ITrainingsToProgramsRepository } from '../../ports/trainings-to-programs.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteTrainingToProgramUseCase {
  constructor(private readonly repo: ITrainingsToProgramsRepository) {}

  async execute(id: number): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Vínculo treino↔programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
