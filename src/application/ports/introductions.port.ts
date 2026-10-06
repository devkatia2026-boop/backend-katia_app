import type { PagedList } from './social-feed.port';

export type IntroductionDTO = {
  id: number;
  program_id: number;
  title: string;
  description: string | null;
  created_at: Date;
};

export type CreateIntroductionInput = {
  program_id: number;
  title: string;
  description: string | null;
};

export type PatchIntroductionInput = Partial<CreateIntroductionInput>;

export type IntroductionListFilters = {
  programId?: number;
  activeProgramOnly?: boolean;
};

export interface IIntroductionsRepository {
  listPaged(
    page: number,
    pageSize: number,
    filters?: IntroductionListFilters
  ): Promise<PagedList<IntroductionDTO>>;
  findById(introductionId: number): Promise<IntroductionDTO | null>;
  create(input: CreateIntroductionInput): Promise<IntroductionDTO>;
  update(introductionId: number, patch: PatchIntroductionInput): Promise<IntroductionDTO>;
  deleteById(introductionId: number): Promise<boolean>;
}
