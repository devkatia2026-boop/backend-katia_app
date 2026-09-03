import type { IFoldersRepository } from '../../ports/folders.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteFolderUseCase {
  constructor(private readonly repo: IFoldersRepository) {}

  async execute(id: number): Promise<void> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Pasta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    await this.repo.deleteById(id);
  }
}
