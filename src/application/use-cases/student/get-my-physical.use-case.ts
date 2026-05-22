import type { IStudentPhysicalsRepository, PhysicalDTO } from '../../ports/student-physicals.port';

const NOT_FOUND = 'PhysicalNotFoundException';

export class GetMyPhysicalUseCase {
  constructor(private readonly repo: IStudentPhysicalsRepository) {}

  async execute(studentId: string, physicalId: number): Promise<PhysicalDTO> {
    const row = await this.repo.findOneOwned(studentId, physicalId);
    if (!row) {
      const err = new Error('Registro físico não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
