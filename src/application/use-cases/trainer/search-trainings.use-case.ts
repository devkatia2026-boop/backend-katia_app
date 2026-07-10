import type { ITrainingsRepository, TrainingPagedList } from '../../ports/trainings.port';
import { parseCatalogSearchQuery } from '../../parsing/catalog-search.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class SearchTrainingsUseCase {
  constructor(private readonly trainings: ITrainingsRepository) {}

  execute(q: unknown, page: unknown, pageSize: unknown): Promise<TrainingPagedList> {
    const term = parseCatalogSearchQuery(q);
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    return this.trainings.searchByNamePaged(term, p, ps);
  }
}
