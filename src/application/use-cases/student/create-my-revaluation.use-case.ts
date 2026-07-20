import type { IRevaluationsRepository, RevaluationDTO } from '../../ports/revaluations.port';
import { parseRevaluationCreateBody } from '../../parsing/revaluation-body.parsing';

const VALIDATION = 'ValidationException';
const FORBIDDEN = 'ForbiddenException';

export class CreateMyRevaluationUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  async execute(studentId: string, body: unknown): Promise<RevaluationDTO> {
    const inRevalution = await this.repo.getInRevalutionStatus(studentId);
    if (!inRevalution) {
      const err = new Error('Você não está em período de reavaliação.');
      err.name = FORBIDDEN;
      throw err;
    }
    const values = parseRevaluationCreateBody(body);
    const created = await this.repo.createForStudent(studentId, values);
    await this.repo.finishRevalution(studentId);
    return created;
  }
}
