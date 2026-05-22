import type { ISetsToTrainingsRepository } from '../../ports/sets-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteSetToTrainingUseCase {
  constructor(private readonly repo: ISetsToTrainingsRepository) {}

  async execute(id: number): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Vínculo set↔treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
