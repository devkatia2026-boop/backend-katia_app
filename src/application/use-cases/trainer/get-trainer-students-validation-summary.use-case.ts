import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';

export class GetTrainerStudentsValidationSummaryUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  execute(trainerId: string) {
    return this.trainerStudents.countValidationSummary(trainerId);
  }
}
