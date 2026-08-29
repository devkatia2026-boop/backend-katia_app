import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import { parseRepsToExercisePatchBody } from '../../parsing/reps-to-exercise-body.parsing';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class UpdateRepsToExerciseUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(
    id: number,
    body: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<RepsToExerciseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    if (auth.role === 'student') {
      if (existing.student_id !== auth.sub) {
        const err = new Error('Você não pode alterar esta orientação.');
        err.name = FORBIDDEN;
        throw err;
      }
      const patch = parseRepsToExercisePatchBody(body);
      if (patch.student_id !== undefined && patch.student_id !== auth.sub) {
        const err = new Error('Você não pode alterar o student_id para outra aluna.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.update(id, patch);
    }

    const tid = await this.repo.getTrainerIdForRowStudent(existing.student_id);
    if (tid !== auth.sub) {
      const err = new Error('Você não pode alterar esta orientação.');
      err.name = FORBIDDEN;
      throw err;
    }
    const patch = parseRepsToExercisePatchBody(body);
    if (patch.student_id !== undefined) {
      const nt = await this.repo.getTrainerIdForRowStudent(patch.student_id);
      if (nt !== auth.sub) {
        const err = new Error('Aluna não encontrada ou não pertence a você.');
        err.name = FORBIDDEN;
        throw err;
      }
    }
    return this.repo.update(id, patch);
  }
}
