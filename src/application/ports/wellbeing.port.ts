import type { PagedList } from './social-feed.port';

export type WellbeingDTO = {
  id: number;
  status: boolean | null;
  photo: string | null;
  tittle: string | null;
  tags: string | null;
  description: string | null;
  created_at: Date;
};

export type CreateWellbeingInput = {
  status: boolean | null;
  photo: string | null;
  tittle: string | null;
  tags: string | null;
  description: string | null;
};

export type PatchWellbeingInput = Partial<CreateWellbeingInput>;

export type WellbeingListFilters = {
  activeOnly?: boolean;
};

export interface IWellbeingRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: WellbeingListFilters
  ): Promise<PagedList<WellbeingDTO>>;
  findById(wellbeingId: number): Promise<WellbeingDTO | null>;
  create(input: CreateWellbeingInput): Promise<WellbeingDTO>;
  update(wellbeingId: number, patch: PatchWellbeingInput): Promise<WellbeingDTO>;
  deleteById(wellbeingId: number): Promise<boolean>;
}
