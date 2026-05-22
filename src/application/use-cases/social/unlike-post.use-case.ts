import type { AuthorRole, ISocialFeedRepository } from '../../ports/social-feed.port';

const NOT_FOUND = 'NotFoundException';

export class UnlikePostUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number): Promise<void> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    await this.repo.removeLike(postId, actorId, actorRole);
  }
}
