import type { EvolutionDTO, IStudentEvolutionsRepository } from '../../ports/student-evolutions.port';

export class ListTrainerStudentEvolutionsUseCase {
  constructor(private readonly repo: IStudentEvolutionsRepository) {}

  execute(trainerId: string, studentId: string): Promise<EvolutionDTO[]> {
    return this.repo.listForTrainerStudent(trainerId, studentId);
  }
}
