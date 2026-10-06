import { parsePlaylistPatchBody } from '../../parsing/playlist-body.parsing';
import type { IPlaylistsRepository, PlaylistDTO } from '../../ports/playlists.port';

export class UpdatePlaylistUseCase {
  constructor(private readonly playlists: IPlaylistsRepository) {}

  execute(playlistId: number, body: unknown): Promise<PlaylistDTO> {
    const patch = parsePlaylistPatchBody(body);
    return this.playlists.update(playlistId, patch);
  }
}
