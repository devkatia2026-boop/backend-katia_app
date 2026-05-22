import type { AuthorRole, ISocialFeedRepository } from '../../ports/social-feed.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteCommentUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number, commentId: number): Promise<void> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    const c = await this.repo.findCommentById(commentId);
    if (!c || c.post_id !== postId) {
      const err = new Error('Comentário não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    if (actorRole === 'student') {
      if (c.author_type !== 'student' || c.author_id !== actorId) {
        const err = new Error('Sem permissão para excluir este comentário.');
        err.name = 'ForbiddenException';
        throw err;
      }
      await this.repo.deleteCommentById(commentId);
      return;
    }

    if (c.author_type === 'trainer') {
      if (c.author_id !== actorId) {
        const err = new Error('Sem permissão para excluir este comentário.');
        err.name = 'ForbiddenException';
        throw err;
      }
      await this.repo.deleteCommentById(commentId);
      return;
    }

    if (c.author_type === 'student' && c.author_id) {
      const ok = await this.repo.studentBelongsToTrainer(c.author_id, actorId);
      if (!ok) {
        const err = new Error('Sem permissão para excluir este comentário.');
        err.name = 'ForbiddenException';
        throw err;
      }
      await this.repo.deleteCommentById(commentId);
      return;
    }

    const err = new Error('Sem permissão para excluir este comentário.');
    err.name = 'ForbiddenException';
    throw err;
  }
}
