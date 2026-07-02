import { parseCouponCreateBody } from '../../parsing/coupon-body.parsing';
import type { IContentStudentsNotifier } from '../../ports/content-students-notifier.port';
import type { CouponDTO, ICouponsRepository } from '../../ports/coupons.port';

export class CreateCouponUseCase {
  constructor(
    private readonly coupons: ICouponsRepository,
    private readonly contentStudentsNotifier: IContentStudentsNotifier
  ) {}

  async execute(body: unknown): Promise<CouponDTO> {
    const input = parseCouponCreateBody(body);
    const created = await this.coupons.create(input);
    try {
      await this.contentStudentsNotifier.notifyCouponCreated(created.id);
    } catch (err) {
      console.error('[content-notifications] notifyCouponCreated:', err);
    }
    return created;
  }
}
