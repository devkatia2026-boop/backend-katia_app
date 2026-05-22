import type { INotificationsRepository, NotificationDTO } from '../../ports/notifications.port';
import type { PagedList } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListNotificationsUseCase {
  constructor(private readonly repo: INotificationsRepository) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<NotificationDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listForMine(p.page, p.pageSize, auth);
  }
}
