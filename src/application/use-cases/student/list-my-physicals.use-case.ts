import type { IStudentPhysicalsRepository, PhysicalDTO } from '../../ports/student-physicals.port';

export class ListMyPhysicalsUseCase {
  constructor(private readonly repo: IStudentPhysicalsRepository) {}

  execute(studentId: string): Promise<PhysicalDTO[]> {
    return this.repo.listByStudentId(studentId);
  }
}
