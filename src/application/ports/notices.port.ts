import type { PagedList } from './social-feed.port';

export type NoticeAudiencePlan = 'exclusive' | 'comum' | 'ambos';

export type NoticeDTO = {
  id: number;
  trainer_id: string;
  message: string | null;
  type_plan: NoticeAudiencePlan;
  created_at: Date;
};

export type CreateNoticeInput = {
  trainer_id: string;
  message: string;
  type_plan: NoticeAudiencePlan;
};

export interface INoticesRepository {
  listPaged(page: number, pageSize: number): Promise<PagedList<NoticeDTO>>;
  findById(noticeId: number): Promise<NoticeDTO | null>;
  create(input: CreateNoticeInput): Promise<NoticeDTO>;
  deleteById(noticeId: number): Promise<boolean>;
}
