import type {
  ExerciseToProgramDTO,
  ExerciseToProgramExercise,
  ExerciseToProgramProgram,
  IExercisesToProgramsRepository,
  ListExercisesToProgramsFilters,
} from '../../ports/exercises-to-programs.port';
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

export type ListExercisesToProgramsResult =
  | PagedList<ExerciseToProgramDTO>
  | PagedList<ExerciseToProgramExercise>
  | PagedList<ExerciseToProgramProgram>;

export class ListExercisesToProgramsUseCase {
  constructor(private readonly repo: IExercisesToProgramsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawProgramId: unknown,
    rawExerciseId: unknown
  ): Promise<ListExercisesToProgramsResult> {
    const p = normalizePagination(page, pageSize);
    const programId = parseOptionalPositiveInt(rawProgramId, 'programId');
    const exerciseId = parseOptionalPositiveInt(rawExerciseId, 'exerciseId');

    if (programId !== undefined && exerciseId === undefined) {
      return this.repo.listExercisesByProgram(programId, p.page, p.pageSize);
    }
    if (exerciseId !== undefined && programId === undefined) {
      return this.repo.listProgramsByExercise(exerciseId, p.page, p.pageSize);
    }

    const filters: ListExercisesToProgramsFilters = { programId, exerciseId };
    return this.repo.listPaged(p.page, p.pageSize, filters);
  }
}
