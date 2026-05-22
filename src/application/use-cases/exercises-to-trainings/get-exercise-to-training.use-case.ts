import type {
  ExerciseToTrainingDTO,
  IExercisesToTrainingsRepository,
} from '../../ports/exercises-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class GetExerciseToTrainingUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  async execute(id: number): Promise<ExerciseToTrainingDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Vínculo exercício↔treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
