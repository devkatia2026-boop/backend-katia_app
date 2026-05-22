import type { ISetsToStudentsRepository } from '../../ports/sets-to-students.port';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class DeleteSetToStudentUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(id: number, trainerSub: string): Promise<void> {
    const ownerId = await this.repo.getStudentIdForLink(id);
    if (ownerId === null) {
      const err = new Error('Vínculo aluna↔set/treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const owns = await this.repo.studentBelongsToTrainer(ownerId, trainerSub);
    if (!owns) {
      const err = new Error('Você não pode excluir este vínculo.');
      err.name = FORBIDDEN;
      throw err;
    }
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Vínculo aluna↔set/treino não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
