import type { ExerciseDTO, IExercisesRepository } from '../../ports/exercises.port';
import { parseExercisePatchBody } from '../../parsing/exercise-body.parsing';

export class UpdateExerciseUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  execute(exerciseId: number, body: unknown): Promise<ExerciseDTO> {
    const patch = parseExercisePatchBody(body);
    return this.exercises.update(exerciseId, patch);
  }
}

