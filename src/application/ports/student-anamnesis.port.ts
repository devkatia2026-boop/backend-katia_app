export type AnamnesisDTO = {
  id: number;
  student_id: string;
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
  created_at: Date;
};

export type AnamnesisUpsertValues = Partial<{
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
}>;

export interface IStudentAnamnesisRepository {
  findLatestByStudentId(studentId: string): Promise<AnamnesisDTO | null>;
  createForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO>;
  updateLatestForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO>;
  /** Apaga todas as linhas de anamnese da aluna, se ela pertencer ao treinador. */
  deleteForTrainerStudent(trainerId: string, studentId: string): Promise<void>;
}

