import type { EvolutionDTO, IStudentEvolutionsRepository } from '../../ports/student-evolutions.port';
import { parseEvolutionPatchBody } from '../../parsing/evolution-body.parsing';

export class UpdateMyEvolutionUseCase {
  constructor(private readonly repo: IStudentEvolutionsRepository) {}

  execute(studentId: string, evolutionId: number, body: unknown): Promise<EvolutionDTO> {
    const values = parseEvolutionPatchBody(body);
    return this.repo.updateOwned(studentId, evolutionId, values);
  }
}
