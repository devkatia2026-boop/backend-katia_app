import type { ExerciseDTO, IExercisesRepository } from '../../ports/exercises.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListExercisesUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<ExerciseDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.exercises.listPaged(p.page, p.pageSize);
  }
}

