import type { IObsToTrainingsRepository, ObsToTrainingDTO } from '../../ports/obs-to-trainings.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseTrainingIdQuery } from '../../parsing/obs-to-training-body.parsing';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class ListObsToTrainingsUseCase {
  constructor(private readonly repo: IObsToTrainingsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawTrainingId: unknown,
    rawStudentId: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<ObsToTrainingDTO>> {
    const p = normalizePagination(page, pageSize);
    const trainingId = parseTrainingIdQuery(rawTrainingId, 'trainingId');

    if (auth.role === 'student') {
      const sid = parseOptionalUuid(rawStudentId, 'studentId');
      if (sid !== undefined && sid !== auth.sub) {
        const err = new Error('Você só pode listar as próprias observações.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listByTrainingForViewer(trainingId, p.page, p.pageSize, auth, undefined);
    }

    const filterStudentId = parseOptionalUuid(rawStudentId, 'studentId');
    return this.repo.listByTrainingForViewer(
      trainingId,
      p.page,
      p.pageSize,
      auth,
      filterStudentId
    );
  }
}
