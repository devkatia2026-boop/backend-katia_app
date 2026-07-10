import type { ExercisePagedList, IExercisesRepository } from '../../ports/exercises.port';
import { parseCatalogSearchQuery } from '../../parsing/catalog-search.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class SearchExercisesUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  execute(q: unknown, page: unknown, pageSize: unknown): Promise<ExercisePagedList> {
    const term = parseCatalogSearchQuery(q);
    const { page: p, pageSize: ps } = normalizePagination(page, pageSize);
    return this.exercises.searchByNamePaged(term, p, ps);
  }
}
