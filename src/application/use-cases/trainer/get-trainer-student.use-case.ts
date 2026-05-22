import type { ITrainerStudentsRepository, TrainerStudentPublic } from '../../ports/trainer-students.port';

const NOT_FOUND = 'StudentNotFoundException';

export class GetTrainerStudentUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  async execute(trainerId: string, studentId: string): Promise<TrainerStudentPublic> {
    const row = await this.trainerStudents.findOneForTrainer(trainerId, studentId);
    if (!row) {
      const err = new Error('Aluna não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
