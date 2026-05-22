import type { PagedList } from './social-feed.port';
import type { SetDTO } from './sets.port';
import type { TrainingDTO } from './trainings.port';

export type SetToTrainingTraining = Pick<
  TrainingDTO,
  'id' | 'lyric' | 'description' | 'created_at'
>;

export type SetToTrainingSet = Pick<SetDTO, 'id' | 'name' | 'order' | 'created_at'>;

export type SetToTrainingDTO = {
  id: number;
  training_id: number;
  set_id: number;
  created_at: Date;
  training: SetToTrainingTraining | null;
  set: SetToTrainingSet | null;
};

export type CreateSetToTrainingInput = {
  training_id: number;
  set_id: number;
};

export type PatchSetToTrainingInput = Partial<{
  training_id: number;
  set_id: number;
}>;

export type ListSetsToTrainingsFilters = {
  trainingId?: number;
  setId?: number;
};

export interface ISetsToTrainingsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListSetsToTrainingsFilters
  ): Promise<PagedList<SetToTrainingDTO>>;
  listSetsByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToTrainingSet>>;
  listTrainingsBySet(
    setId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToTrainingTraining>>;
  findById(id: number): Promise<SetToTrainingDTO | null>;
  create(input: CreateSetToTrainingInput): Promise<SetToTrainingDTO>;
  update(id: number, patch: PatchSetToTrainingInput): Promise<SetToTrainingDTO>;
  deleteById(id: number): Promise<boolean>;
}
