import type { EvolutionDTO, IStudentEvolutionsRepository } from '../../ports/student-evolutions.port';

const NOT_FOUND = 'EvolutionNotFoundException';

export class GetMyEvolutionUseCase {
  constructor(private readonly repo: IStudentEvolutionsRepository) {}

  async execute(studentId: string, evolutionId: number): Promise<EvolutionDTO> {
    const row = await this.repo.findOneOwned(studentId, evolutionId);
    if (!row) {
      const err = new Error('Evolução não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
