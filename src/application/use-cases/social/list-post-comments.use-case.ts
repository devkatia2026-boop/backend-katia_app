import type { ISocialFeedRepository, PagedList, FeedCommentDTO } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

const NOT_FOUND = 'NotFoundException';

export class ListPostCommentsUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(
    postId: number,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<FeedCommentDTO>> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const p = normalizePagination(page, pageSize);
    return this.repo.listCommentsByPostId(postId, p.page, p.pageSize);
  }
}
