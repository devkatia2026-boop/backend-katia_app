export type PhysicalDTO = {
  id: number;
  student_id: string;
  weight: number | null;
  height: number | null;
  objective: string | null;
  created_at: Date;
};

export type PhysicalUpsertValues = Partial<{
  weight: number | null;
  height: number | null;
  objective: string | null;
}>;

export interface IStudentPhysicalsRepository {
  listByStudentId(studentId: string): Promise<PhysicalDTO[]>;
  findOneOwned(studentId: string, physicalId: number): Promise<PhysicalDTO | null>;
  createForStudent(studentId: string, values: PhysicalUpsertValues): Promise<PhysicalDTO>;
  updateOwned(studentId: string, physicalId: number, values: PhysicalUpsertValues): Promise<PhysicalDTO>;
  listForTrainerStudent(trainerId: string, studentId: string): Promise<PhysicalDTO[]>;
}
