import type { AuthorRole, ISocialFeedRepository, CommentDTO } from '../../ports/social-feed.port';
import type { IFeedNotificationPublisher } from '../../ports/feed-notification.port';
import { parseCreateCommentBody } from '../../parsing/social-post-body.parsing';

const NOT_FOUND = 'NotFoundException';

export class CreateCommentUseCase {
  constructor(
    private readonly repo: ISocialFeedRepository,
    private readonly feedNotifications: IFeedNotificationPublisher
  ) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number, body: unknown): Promise<CommentDTO> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const content = parseCreateCommentBody(body);
    const comment = await this.repo.createComment({
      postId,
      authorId: actorId,
      authorType: actorRole,
      content,
    });
    try {
      await this.feedNotifications.notifyNewComment(post, comment, actorRole, actorId);
    } catch (err) {
      console.error('[feed-notifications] notifyNewComment:', err);
    }
    return comment;
  }
}
