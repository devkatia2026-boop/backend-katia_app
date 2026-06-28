import type {
  IProgramsToStudentsRepository,
  ProgramToStudentDTO,
} from '../../ports/programs-to-students.port';
import { parseProgramToStudentCreateBody } from '../../parsing/program-to-student-body.parsing';

export class CreateProgramToStudentUseCase {
  constructor(private readonly repo: IProgramsToStudentsRepository) {}

  execute(body: unknown, studentSub: string): Promise<ProgramToStudentDTO> {
    const input = parseProgramToStudentCreateBody(body);
    return this.repo.create({
      student_id: studentSub.toLowerCase(),
      program_id: input.program_id,
    });
  }
}
