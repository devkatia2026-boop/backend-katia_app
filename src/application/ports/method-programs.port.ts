export type MethodProgramDTO = {
  id: number;
  description: string | null;
  created_at: Date;
};

export type PatchMethodProgramInput = {
  description?: string | null;
};

export interface IMethodProgramsRepository {
  findById(id: number): Promise<MethodProgramDTO | null>;
  update(id: number, patch: PatchMethodProgramInput): Promise<MethodProgramDTO>;
}
