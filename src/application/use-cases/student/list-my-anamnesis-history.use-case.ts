import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListMyAnamnesisHistoryUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(
    studentId: string,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<AnamnesisDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listDivisionHistoryByStudentId(studentId, p.page, p.pageSize);
  }
}
