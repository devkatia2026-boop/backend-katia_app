import type {
  FeedPostDTO,
  FeedViewer,
  ISocialFeedRepository,
} from '../../ports/social-feed.port';
import type { IRestrictionsRepository } from '../../ports/restrictions.port';
import { loadFeedExclusions } from './load-feed-exclusions';

const NOT_FOUND = 'NotFoundException';

export class GetPostUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly restrictions: IRestrictionsRepository
  ) {}

  async execute(postId: number, viewer: FeedViewer): Promise<FeedPostDTO> {
    const exclusions = await loadFeedExclusions(this.restrictions, viewer);
    const post = await this.repo.findFeedPostById(postId, viewer, exclusions);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return post;
  }
}
