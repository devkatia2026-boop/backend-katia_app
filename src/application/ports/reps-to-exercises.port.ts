import type { PagedList } from './social-feed.port';

export type RepsToExerciseStudentBrief = {
  id: string;
  full_name: string;
};

export type RepsToExerciseDTO = {
  id: number;
  exercise_id: number;
  student_id: string;
  reps: string | null;
  obs: string | null;
  created_at: Date;
  student: RepsToExerciseStudentBrief | null;
};

export type CreateRepsToExerciseInput = {
  exercise_id: number;
  student_id: string;
  reps: string | null;
  obs: string | null;
};

export type PatchRepsToExerciseInput = Partial<{
  exercise_id: number;
  student_id: string;
  reps: string | null;
  obs: string | null;
}>;

export interface IRepsToExercisesRepository {
  listByExerciseForViewer(
    exerciseId: number,
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<RepsToExerciseDTO>>;
  findById(id: number): Promise<RepsToExerciseDTO | null>;
  getTrainerIdForRowStudent(studentId: string): Promise<string | null>;
  create(input: CreateRepsToExerciseInput): Promise<RepsToExerciseDTO>;
  update(id: number, patch: PatchRepsToExerciseInput): Promise<RepsToExerciseDTO>;
  deleteById(id: number): Promise<boolean>;
}
