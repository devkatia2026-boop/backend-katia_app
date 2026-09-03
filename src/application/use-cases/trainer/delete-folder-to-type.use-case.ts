import type { IFoldersToTypeRepository } from '../../ports/folders-to-type.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteFolderToTypeUseCase {
  constructor(private readonly repo: IFoldersToTypeRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Vínculo pasta↔conteúdo não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    await this.repo.deleteById(id);
  }
}
