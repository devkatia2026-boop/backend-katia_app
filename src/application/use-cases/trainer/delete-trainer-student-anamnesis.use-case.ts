import type { IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

export class DeleteTrainerStudentAnamnesisUseCase {
  constructor(private readonly anamnesis: IStudentAnamnesisRepository) {}

  execute(trainerId: string, studentId: string): Promise<void> {
    return this.anamnesis.deleteForTrainerStudent(trainerId, studentId);
  }
}
