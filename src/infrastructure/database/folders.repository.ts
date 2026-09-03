import type { WhereOptions } from 'sequelize';
import type {
  CreateFolderInput,
  FolderDTO,
  FolderListFilters,
  IFoldersRepository,
  PatchFolderInput,
} from '../../application/ports/folders.port';
import type { PagedList } from '../../application/ports/social-feed.port';
import type { DatabaseModels } from './models';

const ATTR = ['id', 'title', 'type', 'created_at'] as const;

function toDto(raw: FolderDTO): FolderDTO {
  return {
    id: raw.id,
    title: raw.title,
    type: raw.type as FolderDTO['type'],
    created_at: raw.created_at,
  };
}

function buildWhere(filters?: FolderListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.type !== undefined) {
    where.type = filters.type;
  }
  return where;
}

export class SequelizeFoldersRepository implements IFoldersRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Folder'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: FolderListFilters
  ): Promise<PagedList<FolderDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);

    const [total, rows] = await Promise.all([
      this.models.Folder.count({ where }),
      this.models.Folder.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as unknown as Promise<FolderDTO[]>,
    ]);

    return {
      items: rows.map(toDto),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<FolderDTO | null> {
    const row = await this.models.Folder.findByPk(id, {
      attributes: [...ATTR],
      raw: true,
    });
    if (!row) return null;
    return toDto(row as unknown as FolderDTO);
  }

  async create(input: CreateFolderInput): Promise<FolderDTO> {
    const created = await this.models.Folder.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as FolderDTO;
  }

  async update(id: number, patch: PatchFolderInput): Promise<FolderDTO> {
    const [affected] = await this.models.Folder.update(patch as any, { where: { id } });
    if (affected === 0) {
      const err = new Error('Pasta não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    if (!row) {
      const err = new Error('Pasta não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    return row;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.Folder.destroy({ where: { id } });
    return n > 0;
  }
}
