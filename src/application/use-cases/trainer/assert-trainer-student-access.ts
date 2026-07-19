import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';

const NOT_FOUND = 'StudentNotFoundException';

export async function assertTrainerStudentAccess(
  trainerStudents: ITrainerStudentsRepository,
  trainerId: string,
  studentId: string
): Promise<void> {
  const row = await trainerStudents.findOneForTrainer(trainerId, studentId);
  if (!row) {
    const err = new Error('Aluna não encontrada.');
    err.name = NOT_FOUND;
    throw err;
  }
}
