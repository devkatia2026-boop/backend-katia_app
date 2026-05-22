import type { PagedList } from './social-feed.port';

export type SetDTO = {
  id: number;
  name: string | null;
  order: string | null;
  created_at: Date;
};

export type CreateSetInput = {
  name: string | null;
  order: string | null;
};

export type PatchSetInput = Partial<{
  name: string | null;
  order: string | null;
}>;

export interface ISetsRepository {
  listPaged(page: number, pageSize: number): Promise<PagedList<SetDTO>>;
  findById(setId: number): Promise<SetDTO | null>;
  create(input: CreateSetInput): Promise<SetDTO>;
  update(setId: number, patch: PatchSetInput): Promise<SetDTO>;
  deleteById(setId: number): Promise<boolean>;
}
