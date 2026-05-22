import type { IExercisesRepository } from '../../ports/exercises.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteExerciseUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  async execute(exerciseId: number): Promise<void> {
    const ok = await this.exercises.deleteById(exerciseId);
    if (!ok) {
      const err = new Error('Exercício não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}

