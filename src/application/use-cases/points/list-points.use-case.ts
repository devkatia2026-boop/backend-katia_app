import type { IPointsRepository, PointDTO } from '../../ports/points.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class ListPointsUseCase {
  constructor(private readonly repo: IPointsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<PointDTO>> {
    const p = normalizePagination(page, pageSize);

    if (auth.role === 'student') {
      const sid = parseOptionalUuid(rawStudentId, 'studentId');
      if (sid !== undefined && sid !== auth.sub) {
        const err = new Error('Você só pode listar os próprios registros de treino.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listForViewer(p.page, p.pageSize, auth, undefined);
    }

    const filterStudentId = parseOptionalUuid(rawStudentId, 'studentId');
    return this.repo.listForViewer(p.page, p.pageSize, auth, filterStudentId);
  }
}
