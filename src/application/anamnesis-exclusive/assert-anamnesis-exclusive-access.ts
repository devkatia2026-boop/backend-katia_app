import type { IAnamnesisExclusiveRepository } from '../ports/anamnesis-exclusive.port';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'StudentNotFoundException';

export async function assertAnamnesisExclusiveStudentAccess(
  auth: { role: 'student' | 'trainer'; sub: string },
  studentId: string,
  repo: Pick<IAnamnesisExclusiveRepository, 'isStudentOfTrainer'>
): Promise<void> {
  if (auth.role === 'student') {
    if (auth.sub !== studentId) {
      const err = new Error('Você só pode acessar a própria anamnese exclusive.');
      err.name = FORBIDDEN;
      throw err;
    }
    return;
  }
  const ok = await repo.isStudentOfTrainer(auth.sub, studentId);
  if (!ok) {
    const err = new Error('Aluna não encontrada.');
    err.name = NOT_FOUND;
    throw err;
  }
}
