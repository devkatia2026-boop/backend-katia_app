import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreatePlaylistInput,
  IPlaylistsRepository,
  PatchPlaylistInput,
  PlaylistDTO,
  PlaylistListFilters,
} from '../../application/ports/playlists.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = [
  'id',
  'status',
  'photo',
  'playlist_link',
  'tittle',
  'description',
  'created_at',
] as const;

function buildWhere(filters?: PlaylistListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.activeOnly) {
    where.status = true;
  }
  return where;
}

export class SequelizePlaylistsRepository implements IPlaylistsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Playlist'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: PlaylistListFilters
  ): Promise<PagedList<PlaylistDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.Playlist.count({ where }),
      this.models.Playlist.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<PlaylistDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(playlistId: number): Promise<PlaylistDTO | null> {
    const row = await this.models.Playlist.findByPk(playlistId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as PlaylistDTO) : null;
  }

  async create(input: CreatePlaylistInput): Promise<PlaylistDTO> {
    const row = await this.models.Playlist.create(input);
    return row.get({ plain: true }) as PlaylistDTO;
  }

  async update(playlistId: number, patch: PatchPlaylistInput): Promise<PlaylistDTO> {
    const [n] = await this.models.Playlist.update(patch, { where: { id: playlistId } });
    if (n === 0) {
      const err = new Error('Playlist não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Playlist.findByPk(playlistId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as PlaylistDTO;
  }

  async deleteById(playlistId: number): Promise<boolean> {
    const n = await this.models.Playlist.destroy({ where: { id: playlistId } });
    return n > 0;
  }
}
