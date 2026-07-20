import { normalizePagination } from '../../parsing/pagination.parsing';
import type { INoticesRepository, NoticeDTO } from '../../ports/notices.port';
import type { PagedList } from '../../ports/social-feed.port';

export class ListNoticesUseCase {
  constructor(private readonly notices: INoticesRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<NoticeDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.notices.listPaged(p.page, p.pageSize);
  }
}
