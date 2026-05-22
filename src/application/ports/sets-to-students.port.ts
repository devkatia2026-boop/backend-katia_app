import type { PagedList } from './social-feed.port';
import type { SetDTO } from './sets.port';
import type { TrainingDTO } from './trainings.port';

/** Objeto aninhado: linha em `setstotrainings`. */
export type SetToStudentSetsToTrainingLink = {
  id: number;
  training_id: number;
  set_id: number;
  created_at: Date;
};

/** `setstotrainings` com `set` e `training` (lista filtrada só por `studentId`). */
export type SetToStudentSetsToTrainingWithRelations = SetToStudentSetsToTrainingLink & {
  set: Pick<SetDTO, 'id' | 'name' | 'order' | 'created_at'> | null;
  training: Pick<TrainingDTO, 'id' | 'lyric' | 'description' | 'created_at'> | null;
};

/** Resumo de aluna para lista filtrada por `setstotrainingsId`. */
export type SetToStudentStudentBrief = {
  id: string;
  full_name: string;
  photo_perfil: string | null;
  email: string;
};

/** Linha completa do vínculo + aninhados (lista sem filtro ou com ambos os filtros). */
export type SetToStudentDTO = {
  id: number;
  student_id: string;
  setstotrainings_id: number;
  validity: string | null;
  status: boolean | null;
  created_at: Date;
  student: SetToStudentStudentBrief | null;
  sets_to_training: SetToStudentSetsToTrainingLink | null;
};

/** Lista filtrada só por aluna: linha `setstostudents` + `sets_to_training` (set e treino). */
export type SetToStudentByStudentListItem = Pick<
  SetToStudentDTO,
  'id' | 'student_id' | 'setstotrainings_id' | 'validity' | 'status' | 'created_at'
> & {
  sets_to_training: SetToStudentSetsToTrainingWithRelations | null;
};

export type CreateSetToStudentInput = {
  student_id: string;
  setstotrainings_id: number;
  validity: string | null;
  status: boolean | null;
};

export type PatchSetToStudentInput = Partial<{
  student_id: string;
  setstotrainings_id: number;
  validity: string | null;
  status: boolean | null;
}>;

export type ListSetsToStudentsFilters = {
  studentId?: string;
  setstotrainingsId?: number;
};

export interface ISetsToStudentsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListSetsToStudentsFilters
  ): Promise<PagedList<SetToStudentDTO>>;
  listSetstotrainingsByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentByStudentListItem>>;
  listStudentsBySetstotrainings(
    setstotrainingsId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentStudentBrief>>;
  findById(id: number): Promise<SetToStudentDTO | null>;
  getStudentIdForLink(id: number): Promise<string | null>;
  studentHasLinkToSetstotrainings(studentId: string, setstotrainingsId: number): Promise<boolean>;
  studentBelongsToTrainer(studentId: string, trainerId: string): Promise<boolean>;
  create(input: CreateSetToStudentInput): Promise<SetToStudentDTO>;
  update(id: number, patch: PatchSetToStudentInput): Promise<SetToStudentDTO>;
  deleteById(id: number): Promise<boolean>;
}
