import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';
import { parseRepsToTrainingCreateBody } from '../../parsing/reps-to-training-body.parsing';

export class CreateRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(body: unknown): Promise<RepsToTrainingDTO> {
    const input = parseRepsToTrainingCreateBody(body);

    if (input.exercise_to_training_id != null) {
      const existing = await this.repo.findByExerciseToTrainingId(input.exercise_to_training_id);
      if (existing) {
        return this.repo.update(existing.id, {
          exercise_id: input.exercise_id,
          training_id: input.training_id,
          exercise_to_training_id: input.exercise_to_training_id,
          reps: input.reps,
          obs: input.obs,
          methodology: input.methodology,
          rest: input.rest,
        });
      }
    }

    return this.repo.create(input);
  }
}
