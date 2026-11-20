import type { IExercisesToTrainingsRepository } from '../../ports/exercises-to-trainings.port';

export class DeleteExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  async execute(id: number): Promise<void> {
    await this.repo.deleteById(id);
  }
}
