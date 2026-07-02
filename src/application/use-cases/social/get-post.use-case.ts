import type {
  FeedPostDTO,
  FeedViewer,
  ISocialFeedRepository,
} from '../../ports/social-feed.port';

const NOT_FOUND = 'NotFoundException';

export class GetPostUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(postId: number, viewer: FeedViewer): Promise<FeedPostDTO> {
    const post = await this.repo.findFeedPostById(postId, viewer);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return post;
  }
}
