import type { PagedList } from './social-feed.port';
import type { TrainingDTO } from './trainings.port';
import type { ExerciseDTO } from './exercises.port';

export type ExerciseToTrainingTraining = Pick<
  TrainingDTO,
  'id' | 'lyric' | 'description' | 'created_at'
>;

export type ExerciseToTrainingExercise = Pick<
  ExerciseDTO,
  'id' | 'name' | 'video' | 'type' | 'description' | 'level' | 'created_at'
>;

export type ExerciseToTrainingDTO = {
  id: number;
  training_id: number;
  exercise_id: number;
  created_at: Date;
  training: ExerciseToTrainingTraining | null;
  exercise: ExerciseToTrainingExercise | null;
};

export type CreateExerciseToTrainingInput = {
  training_id: number;
  exercise_id: number;
};

export type PatchExerciseToTrainingInput = Partial<{
  training_id: number;
  exercise_id: number;
}>;

export type ListExercisesToTrainingsFilters = {
  trainingId?: number;
  exerciseId?: number;
};

export interface IExercisesToTrainingsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListExercisesToTrainingsFilters
  ): Promise<PagedList<ExerciseToTrainingDTO>>;
  listExercisesByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToTrainingExercise>>;
  listTrainingsByExercise(
    exerciseId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToTrainingTraining>>;
  findById(id: number): Promise<ExerciseToTrainingDTO | null>;
  create(input: CreateExerciseToTrainingInput): Promise<ExerciseToTrainingDTO>;
  update(id: number, patch: PatchExerciseToTrainingInput): Promise<ExerciseToTrainingDTO>;
  deleteById(id: number): Promise<boolean>;
}
