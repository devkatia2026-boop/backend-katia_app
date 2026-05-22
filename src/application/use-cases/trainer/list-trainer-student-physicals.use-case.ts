import type { IStudentPhysicalsRepository, PhysicalDTO } from '../../ports/student-physicals.port';

export class ListTrainerStudentPhysicalsUseCase {
  constructor(private readonly repo: IStudentPhysicalsRepository) {}

  execute(trainerId: string, studentId: string): Promise<PhysicalDTO[]> {
    return this.repo.listForTrainerStudent(trainerId, studentId);
  }
}
