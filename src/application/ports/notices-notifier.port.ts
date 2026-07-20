import type { NoticeAudiencePlan } from './notices.port';

export interface INoticesNotifier {
  notifyNoticeCreated(
    noticeId: number,
    trainerId: string,
    message: string,
    typePlan: NoticeAudiencePlan
  ): Promise<void>;
}
