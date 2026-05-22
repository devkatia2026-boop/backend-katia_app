import type {
  ISetsToTrainingsRepository,
  ListSetsToTrainingsFilters,
  SetToTrainingDTO,
  SetToTrainingSet,
  SetToTrainingTraining,
} from '../../ports/sets-to-trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

const VALIDATION = 'ValidationException';

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

export type ListSetsToTrainingsResult =
  | PagedList<SetToTrainingDTO>
  | PagedList<SetToTrainingSet>
  | PagedList<SetToTrainingTraining>;

export class ListSetsToTrainingsUseCase {
  constructor(private readonly repo: ISetsToTrainingsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawTrainingId: unknown,
    rawSetId: unknown
  ): Promise<ListSetsToTrainingsResult> {
    const p = normalizePagination(page, pageSize);
    const trainingId = parseOptionalPositiveInt(rawTrainingId, 'trainingId');
    const setId = parseOptionalPositiveInt(rawSetId, 'setId');

    if (trainingId !== undefined && setId === undefined) {
      return this.repo.listSetsByTraining(trainingId, p.page, p.pageSize);
    }
    if (setId !== undefined && trainingId === undefined) {
      return this.repo.listTrainingsBySet(setId, p.page, p.pageSize);
    }

    const filters: ListSetsToTrainingsFilters = { trainingId, setId };
    return this.repo.listPaged(p.page, p.pageSize, filters);
  }
}
