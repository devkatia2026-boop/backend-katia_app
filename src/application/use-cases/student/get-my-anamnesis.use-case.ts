import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

const NOT_FOUND = 'AnamnesisNotFoundException';

export class GetMyAnamnesisUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(studentId: string): Promise<AnamnesisDTO> {
    const row = await this.repo.findLatestByStudentId(studentId);
    if (!row) {
      const err = new Error('Anamnese não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
