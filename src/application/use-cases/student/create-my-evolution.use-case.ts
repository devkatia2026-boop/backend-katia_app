import type { EvolutionDTO, IStudentEvolutionsRepository } from '../../ports/student-evolutions.port';
import { parseEvolutionCreateBody } from '../../parsing/evolution-body.parsing';

export class CreateMyEvolutionUseCase {
  constructor(private readonly repo: IStudentEvolutionsRepository) {}

  execute(studentId: string, body: unknown): Promise<EvolutionDTO> {
    const values = parseEvolutionCreateBody(body);
    return this.repo.createForStudent(studentId, values);
  }
}
