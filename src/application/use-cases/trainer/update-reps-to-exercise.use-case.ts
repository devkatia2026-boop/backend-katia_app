import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import { parseRepsToExercisePatchBody } from '../../parsing/reps-to-exercise-body.parsing';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class UpdateRepsToExerciseUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(id: number, body: unknown, trainerSub: string): Promise<RepsToExerciseDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const tid = await this.repo.getTrainerIdForRowStudent(existing.student_id);
    if (tid !== trainerSub) {
      const err = new Error('Você não pode alterar esta orientação.');
      err.name = FORBIDDEN;
      throw err;
    }
    const patch = parseRepsToExercisePatchBody(body);
    if (patch.student_id !== undefined) {
      const nt = await this.repo.getTrainerIdForRowStudent(patch.student_id);
      if (nt !== trainerSub) {
        const err = new Error('Aluna não encontrada ou não pertence a você.');
        err.name = FORBIDDEN;
        throw err;
      }
    }
    return this.repo.update(id, patch);
  }
}
