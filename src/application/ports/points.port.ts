import type { PagedList } from './social-feed.port';

export type PointStudentBrief = {
  id: string;
  full_name: string;
};

export type PointDTO = {
  id: number;
  student_id: string;
  time: string | null;
  qtt_excercise: number | null;
  created_at: Date;
  student: PointStudentBrief | null;
};

export type CreatePointInput = {
  student_id: string;
  time: string | null;
  qtt_excercise: number | null;
};

export interface IPointsRepository {
  listForViewer(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<PointDTO>>;
  findById(id: number): Promise<PointDTO | null>;
  getStudentTrainerBrief(
    studentId: string
  ): Promise<{ trainer_id: string; full_name: string } | null>;
  create(input: CreatePointInput): Promise<PointDTO>;
}
