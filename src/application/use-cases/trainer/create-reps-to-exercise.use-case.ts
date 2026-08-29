import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import { parseRepsToExerciseCreateBody } from '../../parsing/reps-to-exercise-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class CreateRepsToExerciseUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(
    body: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<RepsToExerciseDTO> {
    const input = parseRepsToExerciseCreateBody(body);

    if (auth.role === 'student') {
      if (input.student_id !== auth.sub) {
        const err = new Error('Você só pode criar orientações para si mesma.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.create(input);
    }

    const tid = await this.repo.getTrainerIdForRowStudent(input.student_id);
    if (tid !== auth.sub) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }
    return this.repo.create(input);
  }
}
