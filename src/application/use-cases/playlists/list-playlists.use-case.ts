import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { IPlaylistsRepository, PlaylistDTO } from '../../ports/playlists.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListPlaylistsUseCase {
  constructor(private readonly playlists: IPlaylistsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole
  ): Promise<PagedList<PlaylistDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.playlists.listPaged(p.page, p.pageSize, {
      activeOnly: listActiveOnlyForRole(role),
    });
  }
}
