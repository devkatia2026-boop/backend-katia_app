import type { FolderDTO, IFoldersRepository } from '../../ports/folders.port';

const NOT_FOUND = 'NotFoundException';

export class GetFolderUseCase {
  constructor(private readonly repo: IFoldersRepository) {}

  async execute(id: number): Promise<FolderDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Pasta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
