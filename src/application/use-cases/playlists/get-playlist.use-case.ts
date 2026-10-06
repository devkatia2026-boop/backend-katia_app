import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { IPlaylistsRepository, PlaylistDTO } from '../../ports/playlists.port';

const NOT_FOUND = 'NotFoundException';

export class GetPlaylistUseCase {
  constructor(private readonly playlists: IPlaylistsRepository) {}

  async execute(playlistId: number, role: ContentViewerRole): Promise<PlaylistDTO> {
    const row = await this.playlists.findById(playlistId);
    if (!row) {
      const err = new Error('Playlist não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      assertActiveForStudent(row.status, 'Playlist não encontrada.');
    }
    return row;
  }
}
