import type { ExercisePagedList, IExercisesRepository } from '../../ports/exercises.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListExercisesUseCase {
  constructor(private readonly exercises: IExercisesRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<ExercisePagedList> {
    const p = normalizePagination(page, pageSize);
    return this.exercises.listPaged(p.page, p.pageSize);
  }
}

