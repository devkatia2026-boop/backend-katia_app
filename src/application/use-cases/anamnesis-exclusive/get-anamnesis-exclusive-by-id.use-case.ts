import { assertAnamnesisExclusiveStudentAccess } from '../../anamnesis-exclusive/assert-anamnesis-exclusive-access';
import { parseOptionalUuid } from '../../parsing/set-to-student-body.parsing';
import type { AnamnesisExclusiveDTO, IAnamnesisExclusiveRepository } from '../../ports/anamnesis-exclusive.port';

const NOT_FOUND = 'AnamnesisExclusiveNotFoundException';
const VALIDATION = 'ValidationException';

export class GetAnamnesisExclusiveByStudentIdUseCase {
  constructor(private readonly repo: IAnamnesisExclusiveRepository) {}

  async execute(
    auth: { role: 'student' | 'trainer'; sub: string },
    rawStudentId: unknown
  ): Promise<AnamnesisExclusiveDTO> {
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    if (!studentId) {
      const err = new Error('Parâmetro "studentId" deve ser um UUID válido.');
      err.name = VALIDATION;
      throw err;
    }
    await assertAnamnesisExclusiveStudentAccess(auth, studentId, this.repo);
    const row = await this.repo.findLatestByStudentId(studentId);
    if (!row) {
      const err = new Error('Anamnese exclusive não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
