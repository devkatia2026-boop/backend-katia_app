import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';
import { parseRepsToTrainingCreateBody } from '../../parsing/reps-to-training-body.parsing';

export class CreateRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  execute(body: unknown): Promise<RepsToTrainingDTO> {
    const input = parseRepsToTrainingCreateBody(body);
    return this.repo.create(input);
  }
}
