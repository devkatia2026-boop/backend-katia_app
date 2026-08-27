import type { PagedList } from './social-feed.port';

export type RepsToTrainingDTO = {
  id: number;
  exercise_id: number;
  training_id: number;
  reps: string | null;
  obs: string | null;
  methodology: string | null;
  rest: string | null;
  created_at: Date;
};

export type CreateRepsToTrainingInput = {
  exercise_id: number;
  training_id: number;
  reps: string | null;
  obs: string | null;
  methodology: string | null;
  rest: string | null;
};

export type PatchRepsToTrainingInput = Partial<{
  exercise_id: number;
  training_id: number;
  reps: string | null;
  obs: string | null;
  methodology: string | null;
  rest: string | null;
}>;

export interface IRepsToTrainingsRepository {
  listByExerciseAndTraining(
    exerciseId: number,
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<RepsToTrainingDTO>>;
  findById(id: number): Promise<RepsToTrainingDTO | null>;
  create(input: CreateRepsToTrainingInput): Promise<RepsToTrainingDTO>;
  update(id: number, patch: PatchRepsToTrainingInput): Promise<RepsToTrainingDTO>;
  deleteById(id: number): Promise<boolean>;
}
