import type { StudentProfileUpdateValues } from './user-profile-updater.port';

export type TrainerStudentPublic = {
  id: string;
  trainer_id: string;
  photo_perfil: string | null;
  full_name: string;
  phone: string | null;
  email: string;
  birth: string | null;
  cpf: string | null;
  type_plan: string | null;
  height: number | null;
  weight: number | null;
  check_winner: boolean | null;
  validation: string | null;
  in_revalution: boolean;
  created_at: Date;
};

export type PaginatedTrainerStudents = {
  items: TrainerStudentPublic[];
  total: number;
  page: number;
  pageSize: number;
};

export type TrainerStudentSearchField = 'name' | 'email';

export type TrainerStudentValidationFilter = 'sim' | 'nao';

export type TrainerStudentPlanFilter = 'exclusive' | 'comum';

export type TrainerStudentsValidationSummary = {
  sim: number;
  nao: number;
  exclusive: number;
  comum: number;
};

export interface ITrainerStudentsRepository {
  countValidationSummary(trainerId: string): Promise<TrainerStudentsValidationSummary>;
  listPaged(
    trainerId: string,
    page: number,
    pageSize: number,
    validation?: TrainerStudentValidationFilter,
    plan?: TrainerStudentPlanFilter
  ): Promise<PaginatedTrainerStudents>;
  searchPaged(
    trainerId: string,
    field: TrainerStudentSearchField,
    term: string,
    page: number,
    pageSize: number,
    validation?: TrainerStudentValidationFilter,
    plan?: TrainerStudentPlanFilter
  ): Promise<PaginatedTrainerStudents>;
  findOneForTrainer(trainerId: string, studentId: string): Promise<TrainerStudentPublic | null>;
  updateStudentForTrainer(
    trainerId: string,
    studentId: string,
    values: StudentProfileUpdateValues
  ): Promise<void>;
}
