import type { ITrainingsRepository, TrainingDTO } from '../../ports/trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListTrainingsUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<TrainingDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.trainings.listPaged(p.page, p.pageSize);
  }
}
