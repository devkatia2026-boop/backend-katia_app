import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListTrainerStudentsUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  execute(trainerId: string, page: unknown, pageSize: unknown) {
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    return this.trainerStudents.listPaged(trainerId, p, ps);
  }
}
