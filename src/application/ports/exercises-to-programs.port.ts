import type { PagedList } from './social-feed.port';
import type { ProgramDTO } from './programs.port';
import type { ExerciseDTO } from './exercises.port';

export type ExerciseToProgramProgram = Pick<
  ProgramDTO,
  'id' | 'name' | 'photo' | 'status' | 'type' | 'description' | 'level' | 'objective' | 'bother' | 'created_at'
>;

export type ExerciseToProgramExercise = Pick<
  ExerciseDTO,
  'id' | 'name' | 'video' | 'type' | 'description' | 'level' | 'created_at'
>;

export type ExerciseToProgramDTO = {
  id: number;
  program_id: number;
  exercise_id: number;
  created_at: Date;
  program: ExerciseToProgramProgram | null;
  exercise: ExerciseToProgramExercise | null;
};

export type CreateExerciseToProgramInput = {
  program_id: number;
  exercise_id: number;
};

export type PatchExerciseToProgramInput = Partial<{
  program_id: number;
  exercise_id: number;
}>;

export type ListExercisesToProgramsFilters = {
  programId?: number;
  exerciseId?: number;
};

export interface IExercisesToProgramsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListExercisesToProgramsFilters
  ): Promise<PagedList<ExerciseToProgramDTO>>;
  listExercisesByProgram(
    programId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToProgramExercise>>;
  listProgramsByExercise(
    exerciseId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToProgramProgram>>;
  findById(id: number): Promise<ExerciseToProgramDTO | null>;
  create(input: CreateExerciseToProgramInput): Promise<ExerciseToProgramDTO>;
  update(id: number, patch: PatchExerciseToProgramInput): Promise<ExerciseToProgramDTO>;
  deleteById(id: number): Promise<boolean>;
}
