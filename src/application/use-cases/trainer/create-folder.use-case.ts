import { parseFolderCreateBody } from '../../parsing/folder-body.parsing';
import type { FolderDTO, IFoldersRepository } from '../../ports/folders.port';

export class CreateFolderUseCase {
  constructor(private readonly repo: IFoldersRepository) {}

  execute(body: unknown): Promise<FolderDTO> {
    const input = parseFolderCreateBody(body);
    return this.repo.create(input);
  }
}
