import type { IRevaluationsRepository, RevaluationCompareResult } from '../../ports/revaluations.port';
import { parseRevaluationCompareQuery } from '../../parsing/revaluation-body.parsing';

const REVALUATION_NOT_FOUND = 'RevaluationNotFoundException';

export class CompareTrainerStudentRevaluationsUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  async execute(
    trainerId: string,
    studentId: string,
    firstIdRaw: unknown,
    secondIdRaw: unknown
  ): Promise<RevaluationCompareResult> {
    const { firstId, secondId } = parseRevaluationCompareQuery(firstIdRaw, secondIdRaw);
    const result = await this.repo.compareForTrainerStudent(
      trainerId,
      studentId,
      firstId,
      secondId
    );
    if (result) return result;
    const err = new Error('Uma ou ambas reavaliações não foram encontradas para esta aluna.');
    err.name = REVALUATION_NOT_FOUND;
    throw err;
  }
}
