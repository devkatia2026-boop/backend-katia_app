import type {
  IProgramsToStudentsRepository,
  ListProgramsToStudentsFilters,
  ProgramToStudentDTO,
  ProgramToStudentProgram,
  ProgramToStudentStudentBrief,
} from '../../ports/programs-to-students.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import {
  parseOptionalProgramId,
  parseOptionalUuid,
} from '../../parsing/program-to-student-body.parsing';
import { parseOptionalProgramSearch } from '../../parsing/program-search.parsing';

const FORBIDDEN = 'ForbiddenException';

function sameStudentId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export type ListProgramsToStudentsAuth = {
  role: 'student' | 'trainer';
  sub: string;
};

export type ListProgramsToStudentsResult =
  | PagedList<ProgramToStudentDTO>
  | PagedList<ProgramToStudentProgram>
  | PagedList<ProgramToStudentStudentBrief>;

export class ListProgramsToStudentsUseCase {
  constructor(private readonly repo: IProgramsToStudentsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    rawStudentId: unknown,
    rawProgramId: unknown,
    rawSearch: unknown,
    auth: ListProgramsToStudentsAuth
  ): Promise<ListProgramsToStudentsResult> {
    const p = normalizePagination(page, pageSize);
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    const programId = parseOptionalProgramId(rawProgramId, 'programId');
    const search = parseOptionalProgramSearch(rawSearch);

    if (auth.role === 'trainer') {
      if (studentId !== undefined && programId === undefined) {
        return this.repo.listProgramsByStudent(studentId, p.page, p.pageSize, search);
      }
      if (programId !== undefined && studentId === undefined) {
        return this.repo.listStudentsByProgram(programId, p.page, p.pageSize, search);
      }
      const filters: ListProgramsToStudentsFilters = { studentId, programId, search };
      return this.repo.listPaged(p.page, p.pageSize, filters);
    }

    if (studentId !== undefined && programId === undefined) {
      if (auth.role === 'student' && !sameStudentId(studentId, auth.sub)) {
        const err = new Error('Você só pode listar os programas da própria aluna.');
        err.name = FORBIDDEN;
        throw err;
      }
      return this.repo.listProgramsByStudent(studentId, p.page, p.pageSize, search);
    }

    if (programId !== undefined && studentId === undefined) {
      return this.repo.listStudentsByProgram(programId, p.page, p.pageSize, search);
    }

    if (studentId !== undefined && programId !== undefined) {
      if (auth.role === 'student' && !sameStudentId(studentId, auth.sub)) {
        const err = new Error('Você só pode consultar a própria aluna.');
        err.name = FORBIDDEN;
        throw err;
      }
      const filters: ListProgramsToStudentsFilters = { studentId, programId, search };
      return this.repo.listPaged(p.page, p.pageSize, filters);
    }

    const selfId = auth.sub.toLowerCase();
    return this.repo.listProgramsByStudent(selfId, p.page, p.pageSize, search);
  }

  executeByProgramId(
    programId: number,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<ProgramToStudentStudentBrief>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listStudentsByProgram(programId, p.page, p.pageSize);
  }
}
