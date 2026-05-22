import type { IObsToTrainingsRepository } from '../../ports/obs-to-trainings.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class DeleteObsToTrainingUseCase {
  constructor(private readonly repo: IObsToTrainingsRepository) {}

  async execute(id: number, trainerSub: string): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Observação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const tid = await this.repo.getTrainerIdForRowStudent(existing.student_id);
    if (tid !== trainerSub) {
      const err = new Error('Você não pode excluir esta observação.');
      err.name = FORBIDDEN;
      throw err;
    }
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Observação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
