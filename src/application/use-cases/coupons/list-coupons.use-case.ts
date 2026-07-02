import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import { listActiveOnlyForRole } from '../../parsing/content-viewer.parsing';
import { normalizePagination } from '../../parsing/pagination.parsing';
import type { CouponDTO, ICouponsRepository } from '../../ports/coupons.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListCouponsUseCase {
  constructor(private readonly coupons: ICouponsRepository) {}

  execute(
    page: unknown,
    pageSize: unknown,
    role: ContentViewerRole
  ): Promise<PagedList<CouponDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.coupons.listPaged(p.page, p.pageSize, {
      activeOnly: listActiveOnlyForRole(role),
    });
  }
}
