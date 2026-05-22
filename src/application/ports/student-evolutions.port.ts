export type EvolutionDTO = {
  id: number;
  student_id: string;
  original_photo: string | null;
  current_photo: string | null;
  created_at: Date;
};

export type EvolutionUpsertValues = Partial<{
  original_photo: string | null;
  current_photo: string | null;
}>;

export interface IStudentEvolutionsRepository {
  listByStudentId(studentId: string): Promise<EvolutionDTO[]>;
  findOneOwned(studentId: string, evolutionId: number): Promise<EvolutionDTO | null>;
  createForStudent(studentId: string, values: EvolutionUpsertValues): Promise<EvolutionDTO>;
  updateOwned(
    studentId: string,
    evolutionId: number,
    values: EvolutionUpsertValues
  ): Promise<EvolutionDTO>;
  listForTrainerStudent(trainerId: string, studentId: string): Promise<EvolutionDTO[]>;
}
