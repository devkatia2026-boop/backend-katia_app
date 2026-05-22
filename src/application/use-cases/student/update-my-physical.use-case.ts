import type { IStudentPhysicalsRepository, PhysicalDTO } from '../../ports/student-physicals.port';
import { parsePhysicalUpsertBody } from '../../parsing/physical-body.parsing';

const VALIDATION = 'ValidationException';

export class UpdateMyPhysicalUseCase {
  constructor(private readonly repo: IStudentPhysicalsRepository) {}

  execute(studentId: string, physicalId: number, body: unknown): Promise<PhysicalDTO> {
    const values = parsePhysicalUpsertBody(body);
    if (Object.keys(values).length === 0) {
      const err = new Error('Informe ao menos um campo para atualizar.');
      err.name = VALIDATION;
      throw err;
    }
    return this.repo.updateOwned(studentId, physicalId, values);
  }
}
