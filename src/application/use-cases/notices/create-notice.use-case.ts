import { parseNoticeCreateBody } from '../../parsing/notice-body.parsing';
import type { INoticesNotifier } from '../../ports/notices-notifier.port';
import type { INoticesRepository, NoticeDTO } from '../../ports/notices.port';

export class CreateNoticeUseCase {
  constructor(
    private readonly notices: INoticesRepository,
    private readonly noticesNotifier: INoticesNotifier
  ) {}

  async execute(trainerId: string, body: unknown): Promise<NoticeDTO> {
    const input = parseNoticeCreateBody(body);
    const created = await this.notices.create({
      trainer_id: trainerId,
      ...input,
    });
    try {
      await this.noticesNotifier.notifyNoticeCreated(
        created.id,
        trainerId,
        created.message ?? input.message,
        created.type_plan
      );
    } catch (err) {
      console.error('[notice-notifications] notifyNoticeCreated:', err);
    }
    return created;
  }
}
