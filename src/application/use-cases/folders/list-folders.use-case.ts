import { normalizePagination } from '../../parsing/pagination.parsing';
import { parseOptionalFolderKindQuery } from '../../parsing/folder-body.parsing';
import type { FolderDTO, IFoldersRepository } from '../../ports/folders.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListFoldersUseCase {
  constructor(private readonly repo: IFoldersRepository) {}

  execute(page: unknown, pageSize: unknown, rawType?: unknown): Promise<PagedList<FolderDTO>> {
    const p = normalizePagination(page, pageSize);
    const type = parseOptionalFolderKindQuery(rawType);
    return this.repo.listPaged(p.page, p.pageSize, type ? { type } : undefined);
  }
}
