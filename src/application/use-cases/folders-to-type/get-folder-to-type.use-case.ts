import type { FolderToTypeDTO, IFoldersToTypeRepository } from '../../ports/folders-to-type.port';

const NOT_FOUND = 'NotFoundException';

export class GetFolderToTypeUseCase {
  constructor(private readonly repo: IFoldersToTypeRepository) {}

  async execute(id: number): Promise<FolderToTypeDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Vínculo pasta↔conteúdo não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
