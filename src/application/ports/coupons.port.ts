import type { PagedList } from './social-feed.port';

export type CouponDTO = {
  id: number;
  status: boolean | null;
  photo: string | null;
  site: string | null;
  code: string | null;
  site_name: string | null;
  percentage: string | null;
  description: string | null;
  created_at: Date;
};

export type CreateCouponInput = {
  status: boolean | null;
  photo: string | null;
  site: string | null;
  code: string | null;
  site_name: string | null;
  percentage: string | null;
  description: string | null;
};

export type PatchCouponInput = Partial<CreateCouponInput>;

export type CouponListFilters = {
  activeOnly?: boolean;
};

export interface ICouponsRepository {
  listPaged(page: number, pageSize: number, filters?: CouponListFilters): Promise<PagedList<CouponDTO>>;
  findById(couponId: number): Promise<CouponDTO | null>;
  create(input: CreateCouponInput): Promise<CouponDTO>;
  update(couponId: number, patch: PatchCouponInput): Promise<CouponDTO>;
  deleteById(couponId: number): Promise<boolean>;
}
