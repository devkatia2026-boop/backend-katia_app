import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateWellInput,
  IWellsRepository,
  PatchWellInput,
  WellDTO,
  WellListFilters,
} from '../../application/ports/wells.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = [
  'id',
  'wellbeing_id',
  'status',
  'photo',
  'video_link',
  'tittle',
  'description',
  'created_at',
] as const;

function buildWhere(filters?: WellListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.activeOnly) {
    where.status = true;
  }
  if (filters?.wellbeingId !== undefined) {
    where.wellbeing_id = filters.wellbeingId;
  }
  return where;
}

export class SequelizeWellsRepository implements IWellsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Well' | 'Wellbeing'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: WellListFilters
  ): Promise<PagedList<WellDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const include = filters?.activeOnly
      ? [
          {
            model: this.models.Wellbeing,
            as: 'wellbeing',
            attributes: [],
            where: { status: true },
            required: true,
          },
        ]
      : undefined;

    const [total, rows] = await Promise.all([
      this.models.Well.count({ where, include, distinct: true }),
      this.models.Well.findAll({
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
      }) as Promise<WellDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(wellId: number): Promise<WellDTO | null> {
    const row = await this.models.Well.findByPk(wellId, { attributes: [...ATTR], raw: true });
    return row ? (row as WellDTO) : null;
  }

  async create(input: CreateWellInput): Promise<WellDTO> {
    const row = await this.models.Well.create(input);
    return row.get({ plain: true }) as WellDTO;
  }

  async update(wellId: number, patch: PatchWellInput): Promise<WellDTO> {
    const [n] = await this.models.Well.update(patch, { where: { id: wellId } });
    if (n === 0) {
      const err = new Error('Well não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Well.findByPk(wellId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as WellDTO;
  }

  async deleteById(wellId: number): Promise<boolean> {
    const n = await this.models.Well.destroy({ where: { id: wellId } });
    return n > 0;
  }

  async countByWellbeingId(wellbeingId: number): Promise<number> {
    return this.models.Well.count({ where: { wellbeing_id: wellbeingId } });
  }
}
