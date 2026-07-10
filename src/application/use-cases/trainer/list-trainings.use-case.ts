import type { ITrainingsRepository, TrainingPagedList } from '../../ports/trainings.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListTrainingsUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<TrainingPagedList> {
    const p = normalizePagination(page, pageSize);
    return this.trainings.listPaged(p.page, p.pageSize);
  }
}
