import type {
  ISetsToStudentsRepository,
  ListSetsToStudentsFilters,
  SetToStudentByStudentListItem,
  SetToStudentDTO,
  SetToStudentStudentBrief,
} from '../../ports/sets-to-students.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalSetsId, parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export type ListSetsToStudentsAuth = {
  role: 'student' | 'trainer';
  sub: string;
};

export type ListSetsToStudentsResult =
  | PagedList<SetToStudentDTO>
  | PagedList<SetToStudentByStudentListItem>
  | PagedList<SetToStudentStudentBrief>;

export class ListSetsToStudentsUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    rawStudentId: unknown,
    rawSetsId: unknown,
    auth: ListSetsToStudentsAuth
  ): Promise<ListSetsToStudentsResult> {
    const p = normalizePagination(page, pageSize);
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    const setsId = parseOptionalSetsId(rawSetsId, 'setsId');

    if (auth.role === 'trainer') {
      if (studentId !== undefined && setsId === undefined) {
        return this.repo.listSetsByStudent(studentId, p.page, p.pageSize);
      }
      if (setsId !== undefined && studentId === undefined) {
        return this.repo.listStudentsBySet(setsId, p.page, p.pageSize);
      }
      const filters: ListSetsToStudentsFilters = { studentId, setsId };
      return this.repo.listPaged(p.page, p.pageSize, filters);
    }

    if (studentId !== undefined && setsId === undefined) {
      if (studentId !== auth.sub) {
        const err = new Error('Você só pode listar vínculos da própria aluna.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listSetsByStudent(studentId, p.page, p.pageSize);
    }

    if (setsId !== undefined && studentId === undefined) {
      const allowed = await this.repo.studentHasLinkToSet(auth.sub, setsId);
      if (!allowed) {
        const err = new Error('Você não possui vínculo com esse set ou não pode ver esta lista.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listStudentsBySet(setsId, p.page, p.pageSize);
    }

    if (studentId !== undefined && setsId !== undefined) {
      if (studentId !== auth.sub) {
        const err = new Error('Você só pode consultar a própria aluna.');
        err.name = FORBIDDEN;
        throw err;
      }
      const allowed = await this.repo.studentHasLinkToSet(auth.sub, setsId);
      if (!allowed) {
        const err = new Error('Vínculo não encontrado para esta combinação.');
        err.name = FORBIDDEN;
        throw err;
      }
      const filters: ListSetsToStudentsFilters = { studentId, setsId };
      return this.repo.listPaged(p.page, p.pageSize, filters);
    }

    const err = new Error('Informe studentId ou setsId para listar.');
    err.name = FORBIDDEN;
    throw err;
  }
}
