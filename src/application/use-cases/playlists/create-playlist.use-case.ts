import { parsePlaylistCreateBody } from '../../parsing/playlist-body.parsing';
import type { IPlaylistsRepository, PlaylistDTO } from '../../ports/playlists.port';

export class CreatePlaylistUseCase {
  constructor(private readonly playlists: IPlaylistsRepository) {}

  execute(body: unknown): Promise<PlaylistDTO> {
    const input = parsePlaylistCreateBody(body);
    return this.playlists.create(input);
  }
}
