import type { IStudentPhysicalsRepository, PhysicalDTO } from '../../ports/student-physicals.port';
import { parsePhysicalUpsertBody } from '../../parsing/physical-body.parsing';

const VALIDATION = 'ValidationException';

export class CreateMyPhysicalUseCase {
  constructor(private readonly repo: IStudentPhysicalsRepository) {}

  async execute(studentId: string, body: unknown): Promise<PhysicalDTO> {
    const values = parsePhysicalUpsertBody(body);
    if (Object.keys(values).length === 0) {
      const err = new Error('Informe ao menos um campo (weight, height ou objective).');
      err.name = VALIDATION;
      throw err;
    }
    return this.repo.createForStudent(studentId, values);
  }
}
