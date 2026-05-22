import type { ITrainerStudentsRepository, TrainerStudentPublic } from '../../ports/trainer-students.port';
import { parseStudentProfileUpdateBody } from '../../parsing/profile-body.parsing';

const VALIDATION = 'ValidationException';

export class UpdateTrainerStudentUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  async execute(trainerId: string, studentId: string, body: unknown): Promise<TrainerStudentPublic> {
    const values = parseStudentProfileUpdateBody(body);
    if (Object.keys(values).length === 0) {
      const err = new Error('Informe ao menos um campo para atualizar.');
      err.name = VALIDATION;
      throw err;
    }

    await this.trainerStudents.updateStudentForTrainer(trainerId, studentId, values);
    const updated = await this.trainerStudents.findOneForTrainer(trainerId, studentId);
    if (!updated) {
      const err = new Error('Aluna não encontrada.');
      err.name = 'StudentNotFoundException';
      throw err;
    }
    return updated;
  }
}
