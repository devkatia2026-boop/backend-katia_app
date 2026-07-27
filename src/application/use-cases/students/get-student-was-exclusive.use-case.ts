import type { ITrainerStudentsRepository } from '../../ports/trainer-students.port';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'StudentNotFoundException';

export type StudentWasExclusiveResult = {
  student_id: string;
  was_exclusive: boolean;
};

export class GetStudentWasExclusiveUseCase {
  constructor(private readonly trainerStudents: ITrainerStudentsRepository) {}

  async execute(
    viewerId: string,
    viewerRole: 'student' | 'trainer',
    studentId: string
  ): Promise<StudentWasExclusiveResult> {
    if (viewerRole === 'student' && viewerId !== studentId) {
      const err = new Error('Você só pode consultar o seu próprio histórico de plano exclusivo.');
      err.name = FORBIDDEN;
      throw err;
    }

    const trainerId = viewerRole === 'trainer' ? viewerId : null;
    const row = await this.trainerStudents.findWasExclusiveForStudent(studentId, trainerId);
    if (!row) {
      const err = new Error('Aluna não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
