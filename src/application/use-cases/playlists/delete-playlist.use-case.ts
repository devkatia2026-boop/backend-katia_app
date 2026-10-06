import type { IPlaylistsRepository } from '../../ports/playlists.port';

const NOT_FOUND = 'NotFoundException';

export class DeletePlaylistUseCase {
  constructor(private readonly playlists: IPlaylistsRepository) {}

  async execute(playlistId: number): Promise<void> {
    const ok = await this.playlists.deleteById(playlistId);
    if (!ok) {
      const err = new Error('Playlist não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
