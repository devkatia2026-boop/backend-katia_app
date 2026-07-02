import type { AuthorRole, ISocialFeedRepository, PostDTO } from '../../ports/social-feed.port';
import type { IFeedNotificationPublisher } from '../../ports/feed-notification.port';
import { parseCreatePostBody } from '../../parsing/social-post-body.parsing';

export class CreatePostUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly feedNotifications: IFeedNotificationPublisher
  ) {}

  async execute(actorId: string, actorRole: AuthorRole, body: unknown): Promise<PostDTO> {
    const { content, image } = parseCreatePostBody(body);
    console.log('[posts] use-case parse', {
      authorId: actorId,
      authorRole: actorRole,
      hasContent: content !== null,
      hasImage: image !== null,
      imageUrl: image,
    });
    const post = await this.repo.createPost({
      authorId: actorId,
      authorType: actorRole,
      content,
      image,
    });
    console.log('[posts] use-case persistido', { postId: post.id, image: post.image });
    try {
      await this.feedNotifications.notifyNewPost(post, actorRole, actorId);
    } catch (err) {
      console.error('[feed-notifications] notifyNewPost:', err);
    }
    return post;
  }
}
