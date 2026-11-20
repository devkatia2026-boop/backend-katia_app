import { parseExerciseToTrainingReorderBody } from '../../parsing/exercise-to-training-reorder.parsing';
import type { IExercisesToTrainingsRepository } from '../../ports/exercises-to-trainings.port';

export class ReorderExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  execute(body: unknown): Promise<void> {
    const { linkId, direction } = parseExerciseToTrainingReorderBody(body);
    return this.repo.reorderByDirection(linkId, direction);
  }
}