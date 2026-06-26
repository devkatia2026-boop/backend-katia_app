import type { PagedList } from './social-feed.port';
import type { SetDTO } from './sets.port';

export type SetToStudentSetNested = Pick<SetDTO, 'id' | 'name' | 'order' | 'created_at'>;

export type SetToStudentStudentBrief = {
  id: string;
  full_name: string;
  photo_perfil: string | null;
  email: string;
};

export type SetToStudentDTO = {
  id: number;
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
  created_at: Date;
  student: SetToStudentStudentBrief | null;
  set: SetToStudentSetNested | null;
};

export type SetToStudentByStudentListItem = Pick<
  SetToStudentDTO,
  'id' | 'student_id' | 'sets_id' | 'validity' | 'status' | 'created_at'
> & {
  set: SetToStudentSetNested | null;
};

export type CreateSetToStudentInput = {
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
};

export type PatchSetToStudentInput = Partial<{
  student_id: string;
  sets_id: number;
  validity: string | null;
  status: boolean | null;
}>;

export type ListSetsToStudentsFilters = {
  studentId?: string;
  setsId?: number;
};

export interface ISetsToStudentsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListSetsToStudentsFilters
  ): Promise<PagedList<SetToStudentDTO>>;
  listSetsByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentByStudentListItem>>;
  listStudentsBySet(
    setsId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentStudentBrief>>;
  findById(id: number): Promise<SetToStudentDTO | null>;
  getStudentIdForLink(id: number): Promise<string | null>;
  studentHasLinkToSet(studentId: string, setsId: number): Promise<boolean>;
  studentBelongsToTrainer(studentId: string, trainerId: string): Promise<boolean>;
  create(input: CreateSetToStudentInput): Promise<SetToStudentDTO>;
  update(id: number, patch: PatchSetToStudentInput): Promise<SetToStudentDTO>;
  deleteById(id: number): Promise<boolean>;
}
