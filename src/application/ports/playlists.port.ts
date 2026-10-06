import type { PagedList } from './social-feed.port';

export type PlaylistDTO = {
  id: number;
  status: boolean | null;
  photo: string | null;
  playlist_link: string | null;
  tittle: string | null;
  description: string | null;
  created_at: Date;
};

export type CreatePlaylistInput = {
  status: boolean | null;
  photo: string | null;
  playlist_link: string | null;
  tittle: string | null;
  description: string | null;
};

export type PatchPlaylistInput = Partial<CreatePlaylistInput>;

export type PlaylistListFilters = {
  activeOnly?: boolean;
};

export interface IPlaylistsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: PlaylistListFilters
  ): Promise<PagedList<PlaylistDTO>>;
  findById(playlistId: number): Promise<PlaylistDTO | null>;
  create(input: CreatePlaylistInput): Promise<PlaylistDTO>;
  update(playlistId: number, patch: PatchPlaylistInput): Promise<PlaylistDTO>;
  deleteById(playlistId: number): Promise<boolean>;
}
