import type {
  ITrainingsToProgramsRepository,
  ListTrainingsToProgramsFilters,
  TrainingToProgramDTO,
  TrainingToProgramProgram,
  TrainingToProgramTraining,
} from '../../ports/trainings-to-programs.port';
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

export type ListTrainingsToProgramsResult =
  | PagedList<TrainingToProgramDTO>
  | PagedList<TrainingToProgramTraining>
  | PagedList<TrainingToProgramProgram>;

export class ListTrainingsToProgramsUseCase {
  constructor(private readonly repo: ITrainingsToProgramsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawProgramId: unknown,
    rawTrainingId: unknown
  ): Promise<ListTrainingsToProgramsResult> {
    const p = normalizePagination(page, pageSize);
    const programId = parseOptionalPositiveInt(rawProgramId, 'programId');
    const trainingId = parseOptionalPositiveInt(rawTrainingId, 'trainingId');

    if (programId !== undefined && trainingId === undefined) {
      return this.repo.listTrainingsByProgram(programId, p.page, p.pageSize);
    }
    if (trainingId !== undefined && programId === undefined) {
      return this.repo.listProgramsByTraining(trainingId, p.page, p.pageSize);
    }

    const filters: ListTrainingsToProgramsFilters = { programId, trainingId };
    return this.repo.listPaged(p.page, p.pageSize, filters);
  }

  executeByProgramId(
    programId: number,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<TrainingToProgramTraining>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listTrainingsByProgram(programId, p.page, p.pageSize);
  }
}
