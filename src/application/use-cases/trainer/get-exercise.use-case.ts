import type { ExerciseDTO, IExercisesRepository } from '../../ports/exercises.port';

const NOT_FOUND = 'NotFoundException';

export class GetExerciseUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  async execute(exerciseId: number): Promise<ExerciseDTO> {
    const row = await this.exercises.findById(exerciseId);
    if (!row) {
      const err = new Error('Exercício não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}

