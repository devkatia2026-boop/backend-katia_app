import { parseCouponPatchBody } from '../../parsing/coupon-body.parsing';
import type { CouponDTO, ICouponsRepository } from '../../ports/coupons.port';

export class UpdateCouponUseCase {
  constructor(private readonly coupons: ICouponsRepository) {}

  execute(couponId: number, body: unknown): Promise<CouponDTO> {
    const patch = parseCouponPatchBody(body);
    return this.coupons.update(couponId, patch);
  }
}
