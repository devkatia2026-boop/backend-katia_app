import type { ISetsToStudentsRepository, SetToStudentDTO } from '../../ports/sets-to-students.port';
import { parseSetToStudentCreateBody } from '../../parsing/set-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';

export class CreateSetToStudentUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(body: unknown, trainerSub: string): Promise<SetToStudentDTO> {
    const input = parseSetToStudentCreateBody(body);
    const ok = await this.repo.studentBelongsToTrainer(input.student_id, trainerSub);
    if (!ok) {
      const err = new Error('Aluna não encontrada ou não pertence a você.');
      err.name = FORBIDDEN;
      throw err;
    }
    return this.repo.create(input);
  }
}
