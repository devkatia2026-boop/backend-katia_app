import type { PagedList } from './social-feed.port';

export type FolderKind = 'T' | 'E' | 'S';

export type FolderDTO = {
  id: number;
  title: string;
  type: FolderKind;
  created_at: Date;
};

export type CreateFolderInput = {
  title: string;
  type: FolderKind;
};

export type PatchFolderInput = Partial<{
  title: string;
}>;

export type FolderListFilters = {
  type?: FolderKind;
};

export interface IFoldersRepository {
  listPaged(page: number, pageSize: number, filters?: FolderListFilters): Promise<PagedList<FolderDTO>>;
  findById(id: number): Promise<FolderDTO | null>;
  create(input: CreateFolderInput): Promise<FolderDTO>;
  update(id: number, patch: PatchFolderInput): Promise<FolderDTO>;
  deleteById(id: number): Promise<boolean>;
}
