import type { IObsToTrainingsRepository, ObsToTrainingDTO } from '../../ports/obs-to-trainings.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class GetObsToTrainingUseCase {
  constructor(private readonly repo: IObsToTrainingsRepository) {}

  async execute(
    id: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<ObsToTrainingDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Observação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (auth.role === 'student') {
      if (row.student_id !== auth.sub) {
        const err = new Error('Você não pode acessar esta observação.');
        err.name = FORBIDDEN;
        throw err;
      }
      return { ...row, student: null };
    }
    const trainerId = await this.repo.getTrainerIdForRowStudent(row.student_id);
    if (trainerId !== auth.sub) {
      const err = new Error('Esta observação não é de uma aluna sua.');
      err.name = FORBIDDEN;
      throw err;
    }
    return row;
  }
}
