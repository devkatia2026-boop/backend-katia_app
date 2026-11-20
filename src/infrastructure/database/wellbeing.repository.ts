import type { Transaction } from 'sequelize';
import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateWellbeingInput,
  IWellbeingRepository,
  PatchWellbeingInput,
  WellbeingDTO,
  WellbeingListFilters,
  WellbeingReorderDirection,
} from '../../application/ports/wellbeing.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = [
  'id',
  'status',
  'photo',
  'tittle',
  'tags',
  'description',
  'sort_order',
  'created_at',
] as const;

const NOT_FOUND = 'NotFoundException';

function buildWhere(filters?: WellbeingListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.activeOnly) {
    where.status = true;
  }
  return where;
}

type WellbeingOrderRow = Pick<WellbeingDTO, 'id' | 'sort_order'>;

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
          ['sort_order', 'ASC'],
          ['id', 'ASC'],
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

  async resolveNextSortOrderForCreate(): Promise<number> {
    const min = (await this.models.Wellbeing.min('sort_order')) as number | null;
    if (min === null || min === undefined) {
      return 0;
    }
    return Number(min) - 1;
  }

  async create(input: CreateWellbeingInput): Promise<WellbeingDTO> {
    const sort_order = await this.resolveNextSortOrderForCreate();
    const row = await this.models.Wellbeing.create({ ...input, sort_order });
    return row.get({ plain: true }) as WellbeingDTO;
  }

  async update(wellbeingId: number, patch: PatchWellbeingInput): Promise<WellbeingDTO> {
    const [n] = await this.models.Wellbeing.update(patch, { where: { id: wellbeingId } });
    if (n === 0) {
      const err = new Error('Wellbeing não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const row = await this.models.Wellbeing.findByPk(wellbeingId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as WellbeingDTO;
  }

  async deleteById(wellbeingId: number): Promise<boolean> {
    const n = await this.models.Wellbeing.destroy({ where: { id: wellbeingId } });
    return n > 0;
  }

  async reorderByDirection(
    wellbeingId: number,
    direction: WellbeingReorderDirection
  ): Promise<void> {
    const sequelize = this.models.Wellbeing.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize indisponível.');
    }

    await sequelize.transaction(async (transaction: Transaction) => {
      const rows = (await this.models.Wellbeing.findAll({
        attributes: ['id', 'sort_order'],
        order: [
          ['sort_order', 'ASC'],
          ['id', 'ASC'],
        ],
        transaction,
        raw: true,
      })) as WellbeingOrderRow[];

      const index = rows.findIndex((row) => row.id === wellbeingId);
      if (index < 0) {
        const err = new Error('Wellbeing não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= rows.length) {
        return;
      }

      const current = rows[index];
      const neighbor = rows[targetIndex];
      const currentOrder = current.sort_order;
      const neighborOrder = neighbor.sort_order;

      await this.models.Wellbeing.update(
        { sort_order: neighborOrder },
        { where: { id: current.id }, transaction }
      );
      await this.models.Wellbeing.update(
        { sort_order: currentOrder },
        { where: { id: neighbor.id }, transaction }
      );
    });
  }
}