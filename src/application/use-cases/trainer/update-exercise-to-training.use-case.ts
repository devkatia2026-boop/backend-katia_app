import type {
  ExerciseToTrainingDTO,
  IExercisesToTrainingsRepository,
} from '../../ports/exercises-to-trainings.port';
import { parseExerciseToTrainingPatchBody } from '../../parsing/exercise-to-training-body.parsing';

export class UpdateExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  execute(id: number, body: unknown): Promise<ExerciseToTrainingDTO> {
    const patch = parseExerciseToTrainingPatchBody(body);
    return this.repo.update(id, patch);
  }
}
