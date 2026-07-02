import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CouponDTO,
  CouponListFilters,
  CreateCouponInput,
  ICouponsRepository,
  PatchCouponInput,
} from '../../application/ports/coupons.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = [
  'id',
  'status',
  'photo',
  'site',
  'code',
  'site_name',
  'percentage',
  'description',
  'created_at',
] as const;

function buildWhere(filters?: CouponListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.activeOnly) {
    where.status = true;
  }
  return where;
}

export class SequelizeCouponsRepository implements ICouponsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Coupon'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: CouponListFilters
  ): Promise<PagedList<CouponDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.Coupon.count({ where }),
      this.models.Coupon.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<CouponDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(couponId: number): Promise<CouponDTO | null> {
    const row = await this.models.Coupon.findByPk(couponId, { attributes: [...ATTR], raw: true });
    return row ? (row as CouponDTO) : null;
  }

  async create(input: CreateCouponInput): Promise<CouponDTO> {
    const row = await this.models.Coupon.create(input);
    return row.get({ plain: true }) as CouponDTO;
  }

  async update(couponId: number, patch: PatchCouponInput): Promise<CouponDTO> {
    const [n] = await this.models.Coupon.update(patch, { where: { id: couponId } });
    if (n === 0) {
      const err = new Error('Cupom não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Coupon.findByPk(couponId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as CouponDTO;
  }

  async deleteById(couponId: number): Promise<boolean> {
    const n = await this.models.Coupon.destroy({ where: { id: couponId } });
    return n > 0;
  }
}
