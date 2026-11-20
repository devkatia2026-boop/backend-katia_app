import type { IRepsToTrainingsRepository, RepsToTrainingDTO } from '../../ports/reps-to-trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import {
  parseExerciseIdQuery,
  parseTrainingIdQuery,
} from '../../parsing/reps-to-training-body.parsing';

export class ListRepsToTrainingsUseCase {
  constructor(private readonly repo: IRepsToTrainingsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawExerciseId: unknown,
    rawTrainingId: unknown
  ): Promise<PagedList<RepsToTrainingDTO>> {
    const p = normalizePagination(page, pageSize);
    const exerciseId =
      rawExerciseId === undefined || rawExerciseId === null || rawExerciseId === ''
        ? undefined
        : parseExerciseIdQuery(rawExerciseId, 'exerciseId');
    const trainingId = parseTrainingIdQuery(rawTrainingId, 'trainingId');

    if (exerciseId === undefined) {
      const items = await this.repo.listByTrainingId(trainingId);
      const offset = (p.page - 1) * p.pageSize;
      return {
        items: items.slice(offset, offset + p.pageSize),
        total: items.length,
        page: p.page,
        pageSize: p.pageSize,
      };
    }

    return this.repo.listByExerciseAndTraining(exerciseId, trainingId, p.page, p.pageSize);
  }
}
