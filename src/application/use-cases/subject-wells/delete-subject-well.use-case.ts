import type { ISubjectWellsRepository } from '../../ports/subject-wells.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteSubjectWellUseCase {
  constructor(private readonly subjectWells: ISubjectWellsRepository) {}

  async execute(subjectWellId: number): Promise<void> {
    const deleted = await this.subjectWells.deleteById(subjectWellId);
    if (!deleted) {
      const err = new Error('Mídia do conteúdo não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}