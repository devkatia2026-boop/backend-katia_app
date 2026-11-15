import type { PagedList } from './social-feed.port';

export type SubjectWellDTO = {
  id: number;
  well_id: number;
  midia: string;
  type: string;
  created_at: Date;
};

export type CreateSubjectWellInput = {
  well_id: number;
  midia: string;
  type: string;
};

export type PatchSubjectWellInput = Partial<CreateSubjectWellInput>;

export type SubjectWellListFilters = {
  wellId?: number;
};

export interface ISubjectWellsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: SubjectWellListFilters
  ): Promise<PagedList<SubjectWellDTO>>;
  findByWellIds(wellIds: number[]): Promise<SubjectWellDTO[]>;
  findById(subjectWellId: number): Promise<SubjectWellDTO | null>;
  create(input: CreateSubjectWellInput): Promise<SubjectWellDTO>;
  update(subjectWellId: number, patch: PatchSubjectWellInput): Promise<SubjectWellDTO>;
  deleteById(subjectWellId: number): Promise<boolean>;
}