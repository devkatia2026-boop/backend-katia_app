import type { IRepsToExercisesRepository, RepsToExerciseDTO } from '../../ports/reps-to-exercises.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseExerciseIdQuery } from '../../parsing/reps-to-exercise-body.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class ListRepsToExercisesUseCase {
  constructor(private readonly repo: IRepsToExercisesRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawExerciseId: unknown,
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<RepsToExerciseDTO>> {
    const p = normalizePagination(page, pageSize);
    const exerciseId = parseExerciseIdQuery(rawExerciseId, 'exerciseId');

    if (auth.role === 'student') {
      const sid = parseOptionalUuid(rawStudentId, 'studentId');
      if (sid !== undefined && sid !== auth.sub) {
        const err = new Error('Você só pode listar as próprias orientações.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listByExerciseForViewer(exerciseId, p.page, p.pageSize, auth, undefined);
    }

    const filterStudentId = parseOptionalUuid(rawStudentId, 'studentId');
    return this.repo.listByExerciseForViewer(
      exerciseId,
      p.page,
      p.pageSize,
      auth,
      filterStudentId
    );
  }
}
