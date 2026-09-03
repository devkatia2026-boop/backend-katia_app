import { assertFolderKindMatches } from '../../parsing/folder-type-consistency.parsing';
import { parseFolderToTypeCreateBody } from '../../parsing/folder-to-type-body.parsing';
import type { IFoldersRepository } from '../../ports/folders.port';
import type { FolderToTypeDTO, IFoldersToTypeRepository } from '../../ports/folders-to-type.port';

const NOT_FOUND = 'NotFoundException';

export class CreateFolderToTypeUseCase {
  constructor(
    private readonly repo: IFoldersToTypeRepository,
    private readonly foldersRepo: IFoldersRepository
  ) {}

  async execute(body: unknown): Promise<FolderToTypeDTO> {
    const input = parseFolderToTypeCreateBody(body);
    const folder = await this.foldersRepo.findById(input.folder_id);

    if (!folder) {
      const err = new Error('Pasta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    assertFolderKindMatches(folder, input.type);
    return this.repo.create(input);
  }
}
