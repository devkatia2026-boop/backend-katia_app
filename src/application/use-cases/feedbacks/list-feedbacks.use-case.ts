import type { IFeedbacksRepository, TrainingFeedbackDTO } from '../../ports/feedbacks.port';
import type { IFeedbackResponsesRepository } from '../../ports/feedback-responses.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';
const VALIDATION = 'ValidationException';

export class ListFeedbacksUseCase {
  constructor(
    private readonly repo: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository
  ) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<TrainingFeedbackDTO>> {
    const p = normalizePagination(page, pageSize);

    if (auth.role === 'student') {
      const sid = parseOptionalUuid(rawStudentId, 'studentId');
      if (sid !== undefined && sid !== auth.sub) {
        const err = new Error('Você só pode listar os próprios feedbacks.');
        err.name = FORBIDDEN;
        throw err;
      }
      const result = await this.repo.listForViewer(p.page, p.pageSize, auth, undefined);
      return this.withResponses(result);
    }

    const filterStudentId = parseOptionalUuid(rawStudentId, 'studentId');
    if (filterStudentId === undefined) {
      const err = new Error('Parâmetro "studentId" é obrigatório para treinadora.');
      err.name = VALIDATION;
      throw err;
    }
    const result = await this.repo.listForViewer(p.page, p.pageSize, auth, filterStudentId);
    return this.withResponses(result);
  }

  private async withResponses(
    result: PagedList<TrainingFeedbackDTO>
  ): Promise<PagedList<TrainingFeedbackDTO>> {
    const grouped = await this.responses.listGroupedByFeedbackIds(result.items.map((i) => i.id));
    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        responses: grouped.get(item.id) ?? [],
      })),
    };
  }
}
