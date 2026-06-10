import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

export class ListTrainerStudentsAnamnesesUseCase {
  constructor(private readonly repo: IStudentAnamnesisRepository) {}

  execute(trainerId: string): Promise<AnamnesisDTO[]> {
    return this.repo.listLatestForTrainer(trainerId);
  }
}
