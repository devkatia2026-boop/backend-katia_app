import type { ExerciseDTO, IExercisesRepository } from '../../ports/exercises.port';
import { parseExerciseCreateBody } from '../../parsing/exercise-body.parsing';

export class CreateExerciseUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  execute(body: unknown): Promise<ExerciseDTO> {
    const input = parseExerciseCreateBody(body);
    return this.exercises.create(input);
  }
}

