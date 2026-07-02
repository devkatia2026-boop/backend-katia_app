import type { ICouponsRepository } from '../../ports/coupons.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteCouponUseCase {
  constructor(private readonly coupons: ICouponsRepository) {}

  async execute(couponId: number): Promise<void> {
    const deleted = await this.coupons.deleteById(couponId);
    if (!deleted) {
      const err = new Error('Cupom não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
