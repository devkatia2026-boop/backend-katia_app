import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

const NOT_FOUND = 'AnamnesisNotFoundException';

export class GetTrainerStudentAnamnesisUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  async execute(trainerId: string, studentId: string): Promise<AnamnesisDTO> {
    const row = await this.repo.findLatestForTrainerStudent(trainerId, studentId);
    if (!row) {
      const err = new Error('Anamnese não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
