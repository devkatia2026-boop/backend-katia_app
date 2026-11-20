import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseExerciseIdQuery, parseOptionalTrainingIdQuery } from '../../parsing/reps-to-exercise-body.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class ListRepsToExercisesUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawExerciseId: unknown,
    rawStudentId: unknown,
    rawTrainingId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<RepsToExerciseDTO>> {
    const p = normalizePagination(page, pageSize);
    const exerciseId =
      rawExerciseId === undefined || rawExerciseId === null || rawExerciseId === ''
        ? undefined
        : parseExerciseIdQuery(rawExerciseId, 'exerciseId');
    const filterTrainingId = parseOptionalTrainingIdQuery(rawTrainingId, 'trainingId');
    const filterStudentId = parseOptionalUuid(rawStudentId, 'studentId');

  if (
      exerciseId === undefined &&
      filterTrainingId !== undefined
    ) {
      const resolvedStudentId =
        auth.role === 'student' ? auth.sub : filterStudentId;
      if (!resolvedStudentId) {
        const err = new Error('Parâmetro "studentId" é obrigatório para treinadoras.');
        err.name = 'ValidationException';
        throw err;
      }
      const items = await this.repo.listByStudentAndTraining(
        resolvedStudentId,
        filterTrainingId
      );
      const offset = (p.page - 1) * p.pageSize;
      return {
        items: items.slice(offset, offset + p.pageSize),
        total: items.length,
        page: p.page,
        pageSize: p.pageSize,
      };
    }

    if (exerciseId === undefined) {
      const err = new Error('Parâmetro "exerciseId" é obrigatório.');
      err.name = 'ValidationException';
      throw err;
    }

    if (auth.role === 'student') {
      const sid = parseOptionalUuid(rawStudentId, 'studentId');
      if (sid !== undefined && sid !== auth.sub) {
        const err = new Error('Você só pode listar as próprias orientações.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listByExerciseForViewer(
        exerciseId,
        p.page,
        p.pageSize,
        auth,
        undefined,
        filterTrainingId
      );
    }

    return this.repo.listByExerciseForViewer(
      exerciseId,
      p.page,
      p.pageSize,
      auth,
      filterStudentId,
      filterTrainingId
    );
  }
}
