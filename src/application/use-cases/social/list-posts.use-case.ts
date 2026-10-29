import type {
  FeedPostDTO,
  FeedViewer,
  ISocialFeedRepository,
  PagedList,
} from '../../ports/social-feed.port';
import type { IRestrictionsRepository } from '../../ports/restrictions.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { loadFeedExclusions } from './load-feed-exclusions';

export class ListPostsUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly restrictions: IRestrictionsRepository
  ) {}

  async execute(
    page: unknown,
    pageSize: unknown,
    viewer: FeedViewer
  ): Promise<PagedList<FeedPostDTO>> {
    const p = normalizePagination(page, pageSize);
    const exclusions = await loadFeedExclusions(this.restrictions, viewer);
    return this.repo.listPosts(p.page, p.pageSize, viewer, exclusions);
  }
}
