import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';
import { parseRepsToTrainingPatchBody } from '../../parsing/reps-to-training-body.parsing';

const NOT_FOUND = 'NotFoundException';

export class UpdateRepsToTrainingUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(id: number, body: unknown): Promise<RepsToTrainingDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Orientação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const patch = parseRepsToTrainingPatchBody(body);
    return this.repo.update(id, patch);
  }
}
