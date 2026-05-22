import type {
  ExerciseToTrainingDTO,
  IExercisesToTrainingsRepository,
} from '../../ports/exercises-to-trainings.port';
import { parseExerciseToTrainingCreateBody } from '../../parsing/exercise-to-training-body.parsing';

export class CreateExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  execute(body: unknown): Promise<ExerciseToTrainingDTO> {
    const input = parseExerciseToTrainingCreateBody(body);
    return this.repo.create(input);
  }
}
