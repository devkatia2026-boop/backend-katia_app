import type { IRepsToTrainingsRepository } from '../../ports/reps-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    await this.repo.deleteById(id);
  }
}
