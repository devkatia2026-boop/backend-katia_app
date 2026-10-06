import type { PagedList } from './social-feed.port';

export type MethodDTO = {
  id: number;
  method_program_id: number;
  title: string;
  link: string;
  created_at: Date;
};

export type CreateMethodInput = {
  method_program_id: number;
  title: string;
  link: string;
};

export type PatchMethodInput = Partial<CreateMethodInput>;

export type MethodListFilters = {
  methodProgramId?: number;
};

export interface IMethodsRepository {
  listPaged(page: number, pageSize: number, filters?: MethodListFilters): Promise<PagedList<MethodDTO>>;
  findById(id: number): Promise<MethodDTO | null>;
  methodProgramExists(methodProgramId: number): Promise<boolean>;
  create(input: CreateMethodInput): Promise<MethodDTO>;
  update(id: number, patch: PatchMethodInput): Promise<MethodDTO>;
  deleteById(id: number): Promise<boolean>;
}
