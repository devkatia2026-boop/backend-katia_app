import type { AuthorRole, ISocialFeedRepository, PostDTO } from '../../ports/social-feed.port';
import { parsePatchPostBody } from '../../parsing/social-post-body.parsing';

const NOT_FOUND = 'NotFoundException';

export class UpdatePostUseCase {
  constructor(private readonly repo: ISocialFeedRepository) {}

  async execute(actorId: string, actorRole: AuthorRole, postId: number, body: unknown): Promise<PostDTO> {
    const post = await this.repo.findPostById(postId);
    if (!post) {
      const err = new Error('Post não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (post.author_id !== actorId || post.author_type !== actorRole) {
      const err = new Error('Sem permissão para editar este post.');
      err.name = 'ForbiddenException';
      throw err;
    }
    const patch = parsePatchPostBody(body);
    return this.repo.updatePostByOwner(postId, actorId, actorRole, patch);
  }
}
