import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';
import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { assertTrainerStudentAccess } from './assert-trainer-student-access';

export class ListTrainerStudentAnamnesisHistoryUseCase {
  constructor(
    private readonly trainerStudents: ITrainerStudentsRepository,
    private readonly repo: IStudentAnamnesisRepository
  ) {}

  async execute(
    trainerId: string,
    studentId: string,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<AnamnesisDTO>> {
    await assertTrainerStudentAccess(this.trainerStudents, trainerId, studentId);
    const p = normalizePagination(page, pageSize);
    return this.repo.listDivisionHistoryByStudentId(studentId, p.page, p.pageSize);
  }
}
