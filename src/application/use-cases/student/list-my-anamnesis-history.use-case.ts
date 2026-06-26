import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

export class ListMyAnamnesisHistoryUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(studentId: string): Promise<AnamnesisDTO[]> {
    return this.repo.listDivisionHistoryByStudentId(studentId);
  }
}
