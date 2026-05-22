import type { AuthorRole, ISocialFeedRepository, CommentDTO } from '../../ports/social-feed.port';
import { parsePatchCommentBody } from '../../parsing/social-post-body.parsing';

const NOT_FOUND = 'NotFoundException';

export class UpdateCommentUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(
    actorId: string,
    actorRole: AuthorRole,
    postId: number,
    commentId: number,
    body: unknown
  ): Promise<CommentDTO> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const comment = await this.repo.findCommentById(commentId);
    if (!comment || comment.post_id !== postId) {
      const err = new Error('Comentário não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (comment.author_id !== actorId || comment.author_type !== actorRole) {
      const err = new Error('Sem permissão para editar este comentário.');
      err.name = 'ForbiddenException';
      throw err;
    }
    const content = parsePatchCommentBody(body);
    return this.repo.updateCommentByOwner(commentId, actorId, actorRole, { content });
  }
}
