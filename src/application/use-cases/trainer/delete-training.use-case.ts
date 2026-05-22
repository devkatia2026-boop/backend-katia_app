import type { ITrainingsRepository } from '../../ports/trainings.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteTrainingUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  async execute(trainingId: number): Promise<void> {
    const ok = await this.trainings.deleteById(trainingId);
    if (!ok) {
      const err = new Error('Treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
