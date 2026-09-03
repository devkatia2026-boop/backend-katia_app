import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateFolderToTypeInput,
  FolderToTypeDTO,
  FolderToTypeListFilters,
  IFoldersToTypeRepository,
  PatchFolderToTypeInput,
} from '../../application/ports/folders-to-type.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = [
  'id',
  'folder_id',
  'training_id',
  'exercise_id',
  'set_id',
  'type',
  'created_at',
] as const;
const FOLDER_ATTR = ['id', 'title', 'type', 'created_at'] as const;
const TRAINING_ATTR = ['id', 'lyric', 'description', 'time', 'type', 'muscles', 'created_at'] as const;
const EXERCISE_ATTR = ['id', 'name', 'video', 'type', 'description', 'level', 'created_at'] as const;
const SET_ATTR = ['id', 'name', 'order', 'cardio', 'stretching', 'created_at'] as const;

function toDto(raw: FolderToTypeDTO): FolderToTypeDTO {
  return {
    id: raw.id,
    folder_id: raw.folder_id,
    training_id: raw.training_id,
    exercise_id: raw.exercise_id,
    set_id: raw.set_id,
    type: raw.type as FolderToTypeDTO['type'],
    created_at: raw.created_at,
    folder: raw.folder ?? null,
    training: raw.training ?? null,
    exercise: raw.exercise ?? null,
    set: raw.set ?? null,
  };
}

function buildWhere(filters?: FolderToTypeListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.folderId !== undefined) where.folder_id = filters.folderId;
  if (filters?.type !== undefined) where.type = filters.type;
  if (filters?.trainingId !== undefined) where.training_id = filters.trainingId;
  if (filters?.exerciseId !== undefined) where.exercise_id = filters.exerciseId;
  if (filters?.setId !== undefined) where.set_id = filters.setId;
  return where;
}

export class SequelizeFoldersToTypeRepository implements IFoldersToTypeRepository {
  constructor(
    private readonly models: Pick<
      DatabaseModels,
      'FoldersToType' | 'Folder' | 'Training' | 'Exercise' | 'Set'
    >
  ) {}

  private buildInclude(filters?: FolderToTypeListFilters) {
    const folderInclude: {
      model: DatabaseModels['Folder'];
      as: 'folder';
      attributes: typeof FOLDER_ATTR;
      required: boolean;
      where?: WhereOptions;
    } = {
      model: this.models.Folder,
      as: 'folder',
      attributes: [...FOLDER_ATTR],
      required: filters?.type !== undefined,
    };

    if (filters?.type !== undefined) {
      folderInclude.where = { type: filters.type };
    }

    return [
      folderInclude,
      {
        model: this.models.Training,
        as: 'training',
        attributes: [...TRAINING_ATTR],
        required: false,
      },
      {
        model: this.models.Exercise,
        as: 'exercise',
        attributes: [...EXERCISE_ATTR],
        required: false,
      },
      { model: this.models.Set, as: 'set', attributes: [...SET_ATTR], required: false },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters?: FolderToTypeListFilters
  ): Promise<PagedList<FolderToTypeDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const include = this.buildInclude(filters);

    const [total, rows] = await Promise.all([
      this.models.FoldersToType.count({ where, include, distinct: true, col: 'id' }),
      this.models.FoldersToType.findAll({
        attributes: [...ATTR],
        where,
        include,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<FolderToTypeDTO[]>,
    ]);

    return {
      items: rows.map(toDto),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<FolderToTypeDTO | null> {
    const row = await this.models.FoldersToType.findByPk(id, {
      attributes: [...ATTR],
      include: this.buildInclude(),
      raw: true,
      nest: true,
    });
    if (!row) return null;
    return toDto(row as unknown as FolderToTypeDTO);
  }

  async create(input: CreateFolderToTypeInput): Promise<FolderToTypeDTO> {
    const created = await this.models.FoldersToType.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as FolderToTypeDTO;
  }

  async update(id: number, patch: PatchFolderToTypeInput): Promise<FolderToTypeDTO> {
    const [affected] = await this.models.FoldersToType.update(patch as any, { where: { id } });
    if (affected === 0) {
      const err = new Error('Vínculo pasta↔conteúdo não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    if (!row) {
      const err = new Error('Vínculo pasta↔conteúdo não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    return row;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.FoldersToType.destroy({ where: { id } });
    return n > 0;
  }
}
