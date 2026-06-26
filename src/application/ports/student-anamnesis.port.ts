export type AnamnesisDTO = {
  id: number;
  student_id: string;
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
  bother: string | null;
  created_at: Date;
};

export type AnamnesisUpsertValues = Partial<{
  main_objective: string | null;
  place_training: string | null;
  days_for_week: string | null;
  level_experience: string | null;
  bother: string | null;
}>;

export interface IStudentAnamnesisRepository {
  findLatestByStudentId(studentId: string): Promise<AnamnesisDTO | null>;
  /** Última anamnese da aluna se pertencer ao treinador; null se aluna ok mas sem registro. */
  findLatestForTrainerStudent(trainerId: string, studentId: string): Promise<AnamnesisDTO | null>;
  /** Uma entrada por aluna (última linha) de todas as alunas do treinador que têm anamnese. */
  listLatestForTrainer(trainerId: string): Promise<AnamnesisDTO[]>;
  listDivisionHistoryByStudentId(studentId: string): Promise<AnamnesisDTO[]>;
  createForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO>;
  updateLatestForStudent(studentId: string, values: AnamnesisUpsertValues): Promise<AnamnesisDTO>;
  /** Apaga todas as linhas de anamnese da aluna, se ela pertencer ao treinador. */
  deleteForTrainerStudent(trainerId: string, studentId: string): Promise<void>;
}

