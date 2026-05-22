import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class GetRepsToExerciseUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(
    id: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<RepsToExerciseDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (auth.role === 'student') {
      if (row.student_id !== auth.sub) {
        const err = new Error('Você não pode acessar esta orientação.');
        err.name = FORBIDDEN;
        throw err;
      }
      return { ...row, student: null };
    }
    const trainerId = await this.repo.getTrainerIdForRowStudent(row.student_id);
    if (trainerId !== auth.sub) {
      const err = new Error('Esta orientação não é de uma aluna sua.');
      err.name = FORBIDDEN;
      throw err;
    }
    return row;
  }
}
