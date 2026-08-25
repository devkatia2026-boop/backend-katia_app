import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class GetRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(id: number): Promise<RepsToTrainingDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
