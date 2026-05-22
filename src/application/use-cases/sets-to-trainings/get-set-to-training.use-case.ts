import type { ISetsToTrainingsRepository, SetToTrainingDTO } from '../../ports/sets-to-trainings.port';

const NOT_FOUND = 'NotFoundException';

export class GetSetToTrainingUseCase {
  constructor(private readonly repo: ISetsToTrainingsRepository) {}

  async execute(id: number): Promise<SetToTrainingDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Vínculo set↔treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
