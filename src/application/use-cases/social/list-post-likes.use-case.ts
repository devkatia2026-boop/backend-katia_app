import type { ISocialFeedRepository, PagedList, LikeDTO } from '../../ports/social-feed.port';
import { normalizePagination } from '../../parsing/pagination.parsing';

const NOT_FOUND = 'NotFoundException';

export class ListPostLikesUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(
    postId: number,
    page: unknown,
    pageSize: unknown
  ): Promise<PagedList<LikeDTO>> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const p = normalizePagination(page, pageSize);
    return this.repo.listLikesByPostId(postId, p.page, p.pageSize);
  }
}
