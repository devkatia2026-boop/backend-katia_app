import type { IRevaluationsRepository, RevaluationDTO } from '../../ports/revaluations.port';

export class ListTrainerStudentRevaluationsUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  async execute(trainerId: string, studentId: string): Promise<{ items: RevaluationDTO[] }> {
    const items = await this.repo.listForTrainerStudent(trainerId, studentId);
    return { items };
  }
}
