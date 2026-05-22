import type { IObsToTrainingsRepository, ObsToTrainingDTO } from '../../ports/obs-to-trainings.port';
import { parseObsToTrainingCreateBody } from '../../parsing/obs-to-training-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class CreateObsToTrainingUseCase {
  constructor(private readonly repo: IObsToTrainingsRepository) {}

  async execute(body: unknown, trainerSub: string): Promise<ObsToTrainingDTO> {
    const input = parseObsToTrainingCreateBody(body);
    const tid = await this.repo.getTrainerIdForRowStudent(input.student_id);
    if (tid !== trainerSub) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }
    return this.repo.create(input);
  }
}
