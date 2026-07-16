import type { IAnamnesisExclusiveRepository } from '../../ports/anamnesis-exclusive.port';

export class GetTrainerAnamnesisExclusiveCountUseCase {
  constructor(private readonly repo: IAnamnesisExclusiveRepository) {}

  async execute(trainerId: string): Promise<number> {
    return this.repo.countByTrainer(trainerId);
  }
}
