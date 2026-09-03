import { assertFolderKindMatches } from '../../parsing/folder-type-consistency.parsing';
import {
  mergeFolderToTypePatch,
  parseFolderToTypePatchBody,
} from '../../parsing/folder-to-type-body.parsing';
import type { IFoldersRepository } from '../../ports/folders.port';
import type { FolderToTypeDTO, IFoldersToTypeRepository } from '../../ports/folders-to-type.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateFolderToTypeUseCase {
  constructor(
    private readonly repo: IFoldersToTypeRepository,
    private readonly foldersRepo: IFoldersRepository
  ) {}

  async execute(id: number, body: unknown): Promise<FolderToTypeDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) {
      const err = new Error('Vínculo pasta↔conteúdo não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    const patch = parseFolderToTypePatchBody(body);
    const merged = mergeFolderToTypePatch(existing, patch);
    const folder = await this.foldersRepo.findById(merged.folder_id);

    if (!folder) {
      const err = new Error('Pasta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }

    assertFolderKindMatches(folder, merged.type);
    return this.repo.update(id, merged);
  }
}
