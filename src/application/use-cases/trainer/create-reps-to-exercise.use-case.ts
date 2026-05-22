import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import { parseRepsToExerciseCreateBody } from '../../parsing/reps-to-exercise-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class CreateRepsToExerciseUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(body: unknown, trainerSub: string): Promise<RepsToExerciseDTO> {
    const input = parseRepsToExerciseCreateBody(body);
    const tid = await this.repo.getTrainerIdForRowStudent(input.student_id);
    if (tid !== trainerSub) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }
    return this.repo.create(input);
  }
}
