import type {
  ExerciseToTrainingDTO,
  ExerciseToTrainingExercise,
  ExerciseToTrainingTraining,
  IExercisesToTrainingsRepository,
  ListExercisesToTrainingsFilters,
} from '../../ports/exercises-to-trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

const VALIDATION = 'ValidationException';

function parseLinksFlag(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return false;
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw === 'boolean') return raw;
  if (typeof raw === 'number') return raw === 1;
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes';
  }
  return false;
}

function parseOptionalPositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  let n: number;
  if (typeof value === 'number') n = value;
  else if (typeof value === 'string') n = parseInt(value, 10);
  else {
    const err = new Error(`Parâmetro "${field}" inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) {
    const err = new Error(`Parâmetro "${field}" inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export type ListExercisesToTrainingsResult =
  | PagedList<ExerciseToTrainingDTO>
  | PagedList<ExerciseToTrainingExercise>
  | PagedList<ExerciseToTrainingTraining>;

export class ListExercisesToTrainingsUseCase {
  constructor(private readonly repo: IExercisesToTrainingsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawTrainingId: unknown,
    rawExerciseId: unknown,
    rawLinks: unknown = false
  ): Promise<ListExercisesToTrainingsResult> {
    const p = normalizePagination(page, pageSize);
    const trainingId = parseOptionalPositiveInt(rawTrainingId, 'trainingId');
    const exerciseId = parseOptionalPositiveInt(rawExerciseId, 'exerciseId');
    const includeLinks = parseLinksFlag(rawLinks);

    if (trainingId !== undefined && exerciseId === undefined) {
      if (includeLinks) {
        return this.repo.listPaged(p.page, p.pageSize, { trainingId });
      }
      return this.repo.listExercisesByTraining(trainingId, p.page, p.pageSize);
    }
    if (exerciseId !== undefined && trainingId === undefined) {
      return this.repo.listTrainingsByExercise(exerciseId, p.page, p.pageSize);
    }

    const filters: ListExercisesToTrainingsFilters = { trainingId, exerciseId };
    return this.repo.listPaged(p.page, p.pageSize, filters);
  }
}
