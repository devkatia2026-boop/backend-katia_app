import type { IExercisesToTrainingsRepository } from '../../ports/exercises-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  async execute(id: number): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Vínculo exercício↔treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
