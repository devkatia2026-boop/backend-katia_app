import type { ISetsToTrainingsRepository, SetToTrainingDTO } from '../../ports/sets-to-trainings.port';
import { parseSetToTrainingPatchBody } from '../../parsing/set-to-training-body.parsing';

export class UpdateSetToTrainingUseCase {
  constructor(private readonly repo: ISetsToTrainingsRepository) {}

  execute(id: number, body: unknown): Promise<SetToTrainingDTO> {
    const patch = parseSetToTrainingPatchBody(body);
    return this.repo.update(id, patch);
  }
}
