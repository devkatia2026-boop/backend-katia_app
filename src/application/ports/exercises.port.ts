import type { PagedList } from './social-feed.port';

export type ExerciseDTO = {
  id: number;
  name: string | null;
  video: string | null;
  type: string | null;
  description: string | null;
  level: string | null;
  created_at: Date;
};

export type CreateExerciseInput = {
  name: string | null;
  video: string | null;
  type: string | null;
  description: string | null;
  level: string | null;
};

export type PatchExerciseInput = Partial<{
  name: string | null;
  video: string | null;
  type: string | null;
  description: string | null;
  level: string | null;
}>;

export interface IExercisesRepository {
  listPaged(page: number, pageSize: number): Promise<PagedList<ExerciseDTO>>;
  findById(exerciseId: number): Promise<ExerciseDTO | null>;
  create(input: CreateExerciseInput): Promise<ExerciseDTO>;
  update(exerciseId: number, patch: PatchExerciseInput): Promise<ExerciseDTO>;
  deleteById(exerciseId: number): Promise<boolean>;
}

