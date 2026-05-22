import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';

const NOT_FOUND = 'NotFoundException';

export class GetTrainingUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  async execute(trainingId: number): Promise<TrainingDTO> {
    const row = await this.trainings.findById(trainingId);
    if (!row) {
      const err = new Error('Treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
