import type { PagedList } from './social-feed.port';

export type TrainingDTO = {
  id: number;
  lyric: string | null;
  description: string | null;
  time: number;
  created_at: Date;
};

export type CreateTrainingInput = {
  lyric: string | null;
  description: string | null;
  time: number;
};

export type PatchTrainingInput = Partial<{
  lyric: string | null;
  description: string | null;
  time: number;
}>;

export interface ITrainingsRepository {
  listPaged(page: number, pageSize: number): Promise<PagedList<TrainingDTO>>;
  findById(trainingId: number): Promise<TrainingDTO | null>;
  create(input: CreateTrainingInput): Promise<TrainingDTO>;
  update(trainingId: number, patch: PatchTrainingInput): Promise<TrainingDTO>;
  deleteById(trainingId: number): Promise<boolean>;
}
