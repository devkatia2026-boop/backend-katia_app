import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateWellbeingInput,
  IWellbeingRepository,
  PatchWellbeingInput,
  WellbeingDTO,
  WellbeingListFilters,
} from '../../application/ports/wellbeing.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'status', 'photo', 'tittle', 'tags', 'description', 'created_at'] as const;

function buildWhere(filters?: WellbeingListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.activeOnly) {
    where.status = true;
  }
  return where;
}

export class SequelizeWellbeingRepository implements IWellbeingRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Wellbeing'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: WellbeingListFilters
  ): Promise<PagedList<WellbeingDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.Wellbeing.count({ where }),
      this.models.Wellbeing.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<WellbeingDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(wellbeingId: number): Promise<WellbeingDTO | null> {
    const row = await this.models.Wellbeing.findByPk(wellbeingId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as WellbeingDTO) : null;
  }

  async create(input: CreateWellbeingInput): Promise<WellbeingDTO> {
    const row = await this.models.Wellbeing.create(input);
    return row.get({ plain: true }) as WellbeingDTO;
  }

  async update(wellbeingId: number, patch: PatchWellbeingInput): Promise<WellbeingDTO> {
    const [n] = await this.models.Wellbeing.update(patch, { where: { id: wellbeingId } });
    if (n === 0) {
      const err = new Error('Wellbeing não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Wellbeing.findByPk(wellbeingId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as WellbeingDTO;
  }

  async deleteById(wellbeingId: number): Promise<boolean> {
    const n = await this.models.Wellbeing.destroy({ where: { id: wellbeingId } });
    return n > 0;
  }
}
