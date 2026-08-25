import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import {
  parseExerciseIdQuery,
  parseTrainingIdQuery,
} from '../../parsing/reps-to-training-body.parsing';

export class ListRepsToTrainingsUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawExerciseId: unknown,
    rawTrainingId: unknown
  ): Promise<PagedList<RepsToTrainingDTO>> {
    const p = normalizePagination(page, pageSize);
    const exerciseId = parseExerciseIdQuery(rawExerciseId, 'exerciseId');
    const trainingId = parseTrainingIdQuery(rawTrainingId, 'trainingId');
    return this.repo.listByExerciseAndTraining(exerciseId, trainingId, p.page, p.pageSize);
  }
}
