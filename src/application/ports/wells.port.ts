import type { PagedList } from './social-feed.port';
import type { SubjectWellDTO } from './subject-wells.port';

export type WellDTO = {
  id: number;
  wellbeing_id: number;
  status: boolean | null;
  tittle: string | null;
  description: string | null;
  created_at: Date;
  subjects: SubjectWellDTO[];
};

export type CreateWellInput = {
  wellbeing_id: number;
  status: boolean | null;
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

export type WellRowDTO = Omit<WellDTO, 'subjects'>;

export interface IWellsRepository {
  listPaged(page: number, pageSize: number, filters?: WellListFilters): Promise<PagedList<WellRowDTO>>;
  findById(wellId: number): Promise<WellRowDTO | null>;
  create(input: CreateWellInput): Promise<WellRowDTO>;
  update(wellId: number, patch: PatchWellInput): Promise<WellRowDTO>;
  deleteById(wellId: number): Promise<boolean>;
  countByWellbeingId(wellbeingId: number): Promise<number>;
}