import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { CouponDTO, ICouponsRepository } from '../../ports/coupons.port';

const NOT_FOUND = 'NotFoundException';

export class GetCouponUseCase {
  constructor(private readonly coupons: ICouponsRepository) {}

  async execute(couponId: number, role: ContentViewerRole): Promise<CouponDTO> {
    const row = await this.coupons.findById(couponId);
    if (!row) {
      const err = new Error('Cupom não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      assertActiveForStudent(row.status, 'Cupom não encontrado.');
    }
    return row;
  }
}
