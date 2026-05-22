import type { AuthorRole, ISocialFeedRepository } from '../../ports/social-feed.port';
import type { IFeedNotificationPublisher } from '../../ports/feed-notification.port';

const NOT_FOUND = 'NotFoundException';

export class LikePostUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly feedNotifications: IFeedNotificationPublisher
  ) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number): Promise<void> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const created = await this.repo.addLike(postId, actorId, actorRole);
    if (!created) return;
    try {
      await this.feedNotifications.notifyNewLike(post, actorRole, actorId);
    } catch (err) {
      console.error('[feed-notifications] notifyNewLike:', err);
    }
  }
}
