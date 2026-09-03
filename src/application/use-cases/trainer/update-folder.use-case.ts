import { parseFolderPatchBody } from '../../parsing/folder-body.parsing';
import type { FolderDTO, IFoldersRepository } from '../../ports/folders.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateFolderUseCase {
  constructor(private readonly repo: IFoldersRepository) {}

  async execute(id: number, body: unknown): Promise<FolderDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Pasta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const patch = parseFolderPatchBody(body);
    return this.repo.update(id, patch);
  }
}
