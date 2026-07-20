import type { IRevaluationsRepository, RevaluationDTO } from '../../ports/revaluations.port';

const REVALUATION_NOT_FOUND = 'RevaluationNotFoundException';

export class GetTrainerStudentRevaluationUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  async execute(
    trainerId: string,
    studentId: string,
    revaluationId: number
  ): Promise<RevaluationDTO> {
    const row = await this.repo.findByIdForTrainerStudent(trainerId, studentId, revaluationId);
    if (row) return row;
    const err = new Error('Reavaliação não encontrada.');
    err.name = REVALUATION_NOT_FOUND;
    throw err;
  }
}
