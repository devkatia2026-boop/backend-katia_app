import type { AuthorRole, CommentDTO, PostDTO } from './social-feed.port';

export interface IFeedNotificationPublisher {
  /** Novo post: notifica treinadora (se aluna) ou todas as alunas (se treinadora). */
  notifyNewPost(post: PostDTO, authorRole: AuthorRole, authorId: string): Promise<void>;
  /** Comentário: notifica o dono do post (se não for ele mesmo). */
  notifyNewComment(
    post: PostDTO,
    comment: CommentDTO,
    actorRole: AuthorRole,
    actorId: string
  ): Promise<void>;
  /** Like novo: notifica o dono do post (se não for ele mesmo). */
  notifyNewLike(post: PostDTO, actorRole: AuthorRole, actorId: string): Promise<void>;
}
