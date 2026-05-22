import type { ISetsToTrainingsRepository, SetToTrainingDTO } from '../../ports/sets-to-trainings.port';
import { parseSetToTrainingCreateBody } from '../../parsing/set-to-training-body.parsing';

export class CreateSetToTrainingUseCase {
  constructor(private readonly repo: ISetsToTrainingsRepository) {}

  execute(body: unknown): Promise<SetToTrainingDTO> {
    const input = parseSetToTrainingCreateBody(body);
    return this.repo.create(input);
  }
}
