import type { ISetsToStudentsRepository, SetToStudentDTO } from '../../ports/sets-to-students.port';
import { parseSetToStudentPatchBody } from '../../parsing/set-to-student-body.parsing';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class UpdateSetToStudentUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(id: number, body: unknown, trainerSub: string): Promise<SetToStudentDTO> {
    const ownerId = await this.repo.getStudentIdForLink(id);
    if (ownerId === null) {
      const err = new Error('Vínculo aluna↔set/treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const owns = await this.repo.studentBelongsToTrainer(ownerId, trainerSub);
    if (!owns) {
      const err = new Error('Você não pode alterar este vínculo.');
      err.name = FORBIDDEN;
      throw err;
    }
    const patch = parseSetToStudentPatchBody(body);
    if (patch.student_id !== undefined) {
      const ok = await this.repo.studentBelongsToTrainer(patch.student_id, trainerSub);
      if (!ok) {
        const err = new Error('Aluna não encontrada ou não pertence a você.');
        err.name = FORBIDDEN;
        throw err;
      }
    }
    return this.repo.update(id, patch);
  }
}
