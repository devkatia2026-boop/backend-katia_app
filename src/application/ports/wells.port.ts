import type { PagedList } from './social-feed.port';

export type WellDTO = {
  id: number;
  wellbeing_id: number;
  status: boolean | null;
  photo: string | null;
  video_link: string | null;
  tittle: string | null;
  description: string | null;
  created_at: Date;
};

export type CreateWellInput = {
  wellbeing_id: number;
  status: boolean | null;
  photo: string | null;
  video_link: string | null;
  tittle: string | null;
  description: string | null;
};

export type PatchWellInput = Partial<Omit<CreateWellInput, 'wellbeing_id'>> & {
  wellbeing_id?: number;
};

export type WellListFilters = {
  activeOnly?: boolean;
  wellbeingId?: number;
};

export interface IWellsRepository {
  listPaged(page: number, pageSize: number, filters?: WellListFilters): Promise<PagedList<WellDTO>>;
  findById(wellId: number): Promise<WellDTO | null>;
  create(input: CreateWellInput): Promise<WellDTO>;
  update(wellId: number, patch: PatchWellInput): Promise<WellDTO>;
  deleteById(wellId: number): Promise<boolean>;
  countByWellbeingId(wellbeingId: number): Promise<number>;
}
