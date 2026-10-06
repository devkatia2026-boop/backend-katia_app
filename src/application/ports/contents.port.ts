import type { PagedList } from './social-feed.port';

export type ContentDTO = {
  id: number;
  introduction_id: number;
  link: string;
  type: string;
  created_at: Date;
};

export type CreateContentInput = {
  introduction_id: number;
  link: string;
  type: string;
};

export type PatchContentInput = Partial<CreateContentInput>;

export type ContentListFilters = {
  introductionId?: number;
  activeProgramOnly?: boolean;
};

export interface IContentsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: ContentListFilters
  ): Promise<PagedList<ContentDTO>>;
  findById(contentId: number): Promise<ContentDTO | null>;
  create(input: CreateContentInput): Promise<ContentDTO>;
  update(contentId: number, patch: PatchContentInput): Promise<ContentDTO>;
  deleteById(contentId: number): Promise<boolean>;
}
