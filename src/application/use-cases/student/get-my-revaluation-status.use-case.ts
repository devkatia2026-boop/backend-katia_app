import type { IRevaluationsRepository } from '../../ports/revaluations.port';

export class GetMyRevaluationStatusUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  execute(studentId: string): Promise<{ in_revalution: boolean }> {
    return this.repo.getInRevalutionStatus(studentId).then((in_revalution) => ({ in_revalution }));
  }
}
