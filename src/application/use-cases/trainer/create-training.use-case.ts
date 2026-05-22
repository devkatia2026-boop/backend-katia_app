import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';
import { parseTrainingCreateBody } from '../../parsing/training-body.parsing';

export class CreateTrainingUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  execute(body: unknown): Promise<TrainingDTO> {
    const input = parseTrainingCreateBody(body);
    return this.trainings.create(input);
  }
}
