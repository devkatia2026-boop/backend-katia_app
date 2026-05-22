import type { PagedList } from './social-feed.port';

export type ObsToTrainingStudentBrief = {
  id: string;
  full_name: string;
};

export type ObsToTrainingDTO = {
  id: number;
  training_id: number;
  student_id: string;
  obs: string | null;
  created_at: Date;
  student: ObsToTrainingStudentBrief | null;
};

export type CreateObsToTrainingInput = {
  training_id: number;
  student_id: string;
  obs: string | null;
};

export type PatchObsToTrainingInput = Partial<{
  training_id: number;
  student_id: string;
  obs: string | null;
}>;

export interface IObsToTrainingsRepository {
  listByTrainingForViewer(
    trainingId: number,
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<ObsToTrainingDTO>>;
  findById(id: number): Promise<ObsToTrainingDTO | null>;
  getTrainerIdForRowStudent(studentId: string): Promise<string | null>;
  create(input: CreateObsToTrainingInput): Promise<ObsToTrainingDTO>;
  update(id: number, patch: PatchObsToTrainingInput): Promise<ObsToTrainingDTO>;
  deleteById(id: number): Promise<boolean>;
}
