import type { AuthorRole, ISocialFeedRepository } from '../../ports/social-feed.port';

const NOT_FOUND = 'NotFoundException';

export class DeletePostUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number): Promise<void> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    if (actorRole === 'student') {
      if (post.author_type !== 'student' || post.author_id !== actorId) {
        const err = new Error('Sem permissão para excluir este post.');
        err.name = 'ForbiddenException';
        throw err;
      }
      await this.repo.deletePostById(postId);
      return;
    }

    if (post.author_type === 'trainer') {
      if (post.author_id === actorId) {
        await this.repo.deletePostById(postId);
        return;
      }
      const err = new Error('Sem permissão para excluir este post.');
      err.name = 'ForbiddenException';
      throw err;
    }

    if (post.author_type === 'student' && post.author_id) {
      const ok = await this.repo.studentBelongsToTrainer(post.author_id, actorId);
      if (!ok) {
        const err = new Error('Sem permissão para excluir este post.');
        err.name = 'ForbiddenException';
        throw err;
      }
      await this.repo.deletePostById(postId);
      return;
    }

    const err = new Error('Sem permissão para excluir este post.');
    err.name = 'ForbiddenException';
    throw err;
  }
}
