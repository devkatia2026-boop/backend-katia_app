import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';
import { parseTrainingPatchBody } from '../../parsing/training-body.parsing';

export class UpdateTrainingUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  execute(trainingId: number, body: unknown): Promise<TrainingDTO> {
    const patch = parseTrainingPatchBody(body);
    return this.trainings.update(trainingId, patch);
  }
}
