import type { ISocialFeedRepository, PagedList, FeedCommentDTO, FeedViewer } from '../../ports/social-feed.port';
import type { IRestrictionsRepository } from '../../ports/restrictions.port';
import { normalizePagination } from '../../parsing/pagination.parsing';
import { loadFeedExclusions } from './load-feed-exclusions';

const NOT_FOUND = 'NotFoundException';

export class ListPostCommentsUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly restrictions: IRestrictionsRepository
  ) {}

  async execute(
    postId: number,
    page: unknown,
    pageSize: unknown,
    viewer: FeedViewer
  ): Promise<PagedList<FeedCommentDTO>> {
    const exclusions = await loadFeedExclusions(this.restrictions, viewer);
    const post = await this.repo.findFeedPostById(postId, viewer, exclusions);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const p = normalizePagination(page, pageSize);
    return this.repo.listCommentsByPostId(postId, p.page, p.pageSize, exclusions);
  }
}
