import { parseCouponCreateBody } from '../../parsing/coupon-body.parsing';
import type { CouponDTO, ICouponsRepository } from '../../ports/coupons.port';

export class CreateCouponUseCase {
  constructor(private readonly coupons: ICouponsRepository) {}

  execute(body: unknown): Promise<CouponDTO> {
    const input = parseCouponCreateBody(body);
    return this.coupons.create(input);
  }
}
