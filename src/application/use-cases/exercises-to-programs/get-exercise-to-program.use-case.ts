import type {
  ExerciseToProgramDTO,
  IExercisesToProgramsRepository,
} from '../../ports/exercises-to-programs.port';

const NOT_FOUND = 'NotFoundException';

export class GetExerciseToProgramUseCase {
  constructor(private readonly repo: IExercisesToProgramsRepository) {}

  async execute(id: number): Promise<ExerciseToProgramDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Vínculo exercício↔programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
