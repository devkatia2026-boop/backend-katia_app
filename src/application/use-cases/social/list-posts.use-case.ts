import type { ISocialFeedRepository, PagedList, PostDTO } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListPostsUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  execute(page: unknown, pageSize: unknown): Promise<PagedList<PostDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listPosts(p.page, p.pageSize);
  }
}
