import { evaluateAnamnesisExclusiveCompletion } from '../../anamnesis-exclusive/anamnesis-exclusive-completion';
import { assertAnamnesisExclusiveStudentAccess } from '../../anamnesis-exclusive/assert-anamnesis-exclusive-access';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';
import type {
  AnamnesisExclusiveCompletionResult,
  IAnamnesisExclusiveRepository,
} from '../../ports/anamnesis-exclusive.port';

const VALIDATION = 'ValidationException';

export class GetAnamnesisExclusiveCompletionUseCase {
  constructor(private readonly repo: IAnamnesisExclusiveRepository) {}

  async execute(
    auth: { role: 'student' | 'trainer'; sub: string },
    rawStudentId: unknown
  ): Promise<AnamnesisExclusiveCompletionResult> {
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    if (!studentId) {
      const err = new Error('Parâmetro "studentId" deve ser um UUID válido.');
      err.name = VALIDATION;
      throw err;
    }
    await assertAnamnesisExclusiveStudentAccess(auth, studentId, this.repo);
    const latest = await this.repo.findLatestByStudentId(studentId);
    return evaluateAnamnesisExclusiveCompletion(studentId, latest);
  }
}
