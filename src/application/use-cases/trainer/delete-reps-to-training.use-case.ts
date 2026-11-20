import type { IRepsToTrainingsRepository } from '../../ports/reps-to-trainings.port';

export class DeleteRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(id: number): Promise<void> {
    await this.repo.deleteById(id);
  }
}
