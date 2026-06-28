import type { IProgramsToStudentsRepository } from '../../ports/programs-to-students.port';
import { parseProgramIdQuery } from '../../parsing/program-to-student-body.parsing';

const NOT_FOUND = 'NotFoundException';

export class LeaveProgramToStudentUseCase {
  constructor(private readonly repo: IProgramsToStudentsRepository) {}

  async execute(rawProgramId: unknown, studentSub: string): Promise<void> {
    const programId = parseProgramIdQuery(rawProgramId, 'programId');
    const studentId = studentSub.toLowerCase();
    const removed = await this.repo.deleteByProgramAndStudent(studentId, programId);
    if (!removed) {
      const err = new Error('Você não faz parte deste programa.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
