import type { PagedList } from './social-feed.port';
import type { ProgramDTO } from './programs.port';
import type { TrainingDTO } from './trainings.port';

export type TrainingToProgramProgram = Pick<
  ProgramDTO,
  'id' | 'name' | 'photo' | 'status' | 'type' | 'description' | 'level' | 'created_at'
>;

export type TrainingToProgramTraining = Pick<
  TrainingDTO,
  'id' | 'lyric' | 'description' | 'time' | 'type' | 'created_at'
>;

export type TrainingToProgramDTO = {
  id: number;
  program_id: number;
  training_id: number;
  created_at: Date;
  program: TrainingToProgramProgram | null;
  training: TrainingToProgramTraining | null;
};

export type CreateTrainingToProgramInput = {
  program_id: number;
  training_id: number;
};

export type ListTrainingsToProgramsFilters = {
  programId?: number;
  trainingId?: number;
};

export interface ITrainingsToProgramsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters: ListTrainingsToProgramsFilters
  ): Promise<PagedList<TrainingToProgramDTO>>;
  listTrainingsByProgram(
    programId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<TrainingToProgramTraining>>;
  listProgramsByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<TrainingToProgramProgram>>;
  findById(id: number): Promise<TrainingToProgramDTO | null>;
  create(input: CreateTrainingToProgramInput): Promise<TrainingToProgramDTO>;
}
