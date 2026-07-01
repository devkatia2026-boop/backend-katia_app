import type { PagedList } from './social-feed.port';
import type { ProgramDTO } from './programs.port';

export type ProgramToStudentProgram = Pick<
  ProgramDTO,
  'id' | 'name' | 'photo' | 'status' | 'type' | 'description' | 'level' | 'objective' | 'bother' | 'created_at'
>;

export type ProgramToStudentStudentBrief = {
  id: string;
  full_name: string;
  photo_perfil: string | null;
  email: string;
};

export type ProgramToStudentDTO = {
  id: number;
  student_id: string;
  program_id: number;
  created_at: Date;
  student: ProgramToStudentStudentBrief | null;
  program: ProgramToStudentProgram | null;
};

export type ProgramToStudentByStudentListItem = Pick<
  ProgramToStudentDTO,
  'id' | 'student_id' | 'program_id' | 'created_at'
> & {
  program: ProgramToStudentProgram | null;
};

export type CreateProgramToStudentInput = {
  student_id: string;
  program_id: number;
};

export type ListProgramsToStudentsFilters = {
  studentId?: string;
  programId?: number;
  search?: string;
};

export interface IProgramsToStudentsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListProgramsToStudentsFilters
  ): Promise<PagedList<ProgramToStudentDTO>>;
  listProgramsByStudent(
    studentId: string,
    page: number,
    pageSize: number,
    search?: string
  ): Promise<PagedList<ProgramToStudentProgram>>;
  listStudentsByProgram(
    programId: number,
    page: number,
    pageSize: number,
    search?: string
  ): Promise<PagedList<ProgramToStudentStudentBrief>>;
  deleteByProgramAndStudent(studentId: string, programId: number): Promise<boolean>;
  create(input: CreateProgramToStudentInput): Promise<ProgramToStudentDTO>;
}
