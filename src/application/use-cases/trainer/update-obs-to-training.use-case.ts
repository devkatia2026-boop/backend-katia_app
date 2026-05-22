import type { IObsToTrainingsRepository, ObsToTrainingDTO } from '../../ports/obs-to-trainings.port';
import { parseObsToTrainingPatchBody } from '../../parsing/obs-to-training-body.parsing';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class UpdateObsToTrainingUseCase {
  constructor(private readonly repo: IObsToTrainingsRepository) {}

  async execute(id: number, body: unknown, trainerSub: string): Promise<ObsToTrainingDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Observação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const tid = await this.repo.getTrainerIdForRowStudent(existing.student_id);
    if (tid !== trainerSub) {
      const err = new Error('Você não pode alterar esta observação.');
      err.name = FORBIDDEN;
      throw err;
    }
    const patch = parseObsToTrainingPatchBody(body);
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
