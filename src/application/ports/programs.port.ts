import type { PagedList } from './social-feed.port';

export type ProgramDTO = {
  id: number;
  name: string | null;
  photo: string | null;
  status: boolean | null;
  type: string | null;
  description: string | null;
  level: string | null;
  objective: string | null;
  bother: string | null;
  created_at: Date;
};

export type CreateProgramInput = {
  name: string;
  photo: string | null;
  status: boolean | null;
  type: string | null;
  description: string | null;
  level: string | null;
  objective: string | null;
  bother: string | null;
};

export type PatchProgramInput = Partial<{
  name: string | null;
  photo: string | null;
  status: boolean | null;
  type: string | null;
  description: string | null;
  level: string | null;
  objective: string | null;
  bother: string | null;
}>;

export type ProgramListFilters = {
  search?: string;
  activeOnly?: boolean;
  type?: ProgramTypeFilter;
};

export type ProgramTypeFilter = 'casa' | 'academia' | 'ambos';

export type ProgramTypeCounts = {
  Casa: number;
  Academia: number;
  'Casa/Academia': number;
};

export type ProgramPagedList = {
  total: number;
  totalPage: number;
  typeCounts: ProgramTypeCounts;
  items: ProgramDTO[];
  page: number;
  pageSize: number;
};

export interface IProgramsRepository {
  listPaged(page: number, pageSize: number, filters?: ProgramListFilters): Promise<ProgramPagedList>;
  listActive(search?: string): Promise<ProgramDTO[]>;
  findById(programId: number): Promise<ProgramDTO | null>;
  create(input: CreateProgramInput): Promise<ProgramDTO>;
  update(programId: number, patch: PatchProgramInput): Promise<ProgramDTO>;
  deleteById(programId: number): Promise<boolean>;
}
