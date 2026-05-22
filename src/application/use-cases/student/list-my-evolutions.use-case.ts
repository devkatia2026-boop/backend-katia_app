import type { EvolutionDTO, IStudentEvolutionsRepository } from '../../ports/student-evolutions.port';

export class ListMyEvolutionsUseCase {
  constructor(private readonly repo: IStudentEvolutionsRepository) {}

  execute(studentId: string): Promise<EvolutionDTO[]> {
    return this.repo.listByStudentId(studentId);
  }
}
