import type {
  FeedPostDTO,
  FeedViewer,
  ISocialFeedRepository,
  PagedList,
} from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

export class ListPostsUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  execute(page: unknown, pageSize: unknown, viewer: FeedViewer): Promise<PagedList<FeedPostDTO>> {
    const p = normalizePagination(page, pageSize);
    return this.repo.listPosts(p.page, p.pageSize, viewer);
  }
}
