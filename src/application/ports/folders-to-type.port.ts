import type { PagedList } from './social-feed.port';
import type { ExerciseDTO } from './exercises.port';
import type { SetDTO } from './sets.port';
import type { TrainingDTO } from './trainings.port';
import type { FolderDTO } from './folders.port';

export type FolderToTypeKind = 'T' | 'E' | 'S';

export type FolderToTypeTraining = Pick<
  TrainingDTO,
  'id' | 'lyric' | 'description' | 'time' | 'type' | 'muscles' | 'created_at'
>;

export type FolderToTypeExercise = Pick<
  ExerciseDTO,
  'id' | 'name' | 'video' | 'type' | 'description' | 'level' | 'created_at'
>;

export type FolderToTypeSet = Pick<
  SetDTO,
  'id' | 'name' | 'order' | 'cardio' | 'stretching' | 'created_at'
>;

export type FolderToTypeFolder = Pick<FolderDTO, 'id' | 'title' | 'type' | 'created_at'>;

export type FolderToTypeDTO = {
  id: number;
  folder_id: number;
  training_id: number | null;
  exercise_id: number | null;
  set_id: number | null;
  type: FolderToTypeKind;
  created_at: Date;
  folder: FolderToTypeFolder | null;
  training: FolderToTypeTraining | null;
  exercise: FolderToTypeExercise | null;
  set: FolderToTypeSet | null;
};

export type CreateFolderToTypeInput = {
  folder_id: number;
  training_id: number | null;
  exercise_id: number | null;
  set_id: number | null;
  type: FolderToTypeKind;
};

export type PatchFolderToTypeInput = Partial<{
  folder_id: number;
  training_id: number | null;
  exercise_id: number | null;
  set_id: number | null;
  type: FolderToTypeKind;
}>;

export type FolderToTypeListFilters = {
  folderId?: number;
  type?: FolderToTypeKind;
  trainingId?: number;
  exerciseId?: number;
  setId?: number;
};

export interface IFoldersToTypeRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: FolderToTypeListFilters
  ): Promise<PagedList<FolderToTypeDTO>>;
  findById(id: number): Promise<FolderToTypeDTO | null>;
  create(input: CreateFolderToTypeInput): Promise<FolderToTypeDTO>;
  update(id: number, patch: PatchFolderToTypeInput): Promise<FolderToTypeDTO>;
  deleteById(id: number): Promise<boolean>;
}
