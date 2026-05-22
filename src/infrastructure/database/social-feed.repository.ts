import type { DatabaseModels } from './models';
import type {
  AuthorRole,
  CommentDTO,
  CreateCommentInput,
  CreatePostInput,
  ISocialFeedRepository,
  LikeDTO,
  PagedList,
  PatchCommentInput,
  PatchPostInput,
  PostDTO,
} from '../../application/ports/social-feed.port';

export class SequelizeSocialFeedRepository implements ISocialFeedRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Post' | 'Comment' | 'Like' | 'Student'>
  ) {}

  async createPost(input: CreatePostInput): Promise<PostDTO> {
    const row = await this.models.Post.create({
      author_id: input.authorId,
      author_type: input.authorType,
      content: input.content,
      image: input.image,
    });
    return row.toJSON() as PostDTO;
  }

  async listPosts(page: number, pageSize: number): Promise<PagedList<PostDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Post.count(),
      this.models.Post.findAll({
        attributes: ['id', 'author_id', 'author_type', 'image', 'content', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<PostDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findPostById(postId: number): Promise<PostDTO | null> {
    const row = await this.models.Post.findByPk(postId);
    return row ? (row.toJSON() as PostDTO) : null;
  }

  async updatePostByOwner(
    postId: number,
    authorId: string,
    authorType: AuthorRole,
    patch: PatchPostInput
  ): Promise<PostDTO> {
    const [n] = await this.models.Post.update(patch, {
      where: { id: postId, author_id: authorId, author_type: authorType },
    });
    if (n === 0) {
      const err = new Error('Post não encontrado ou sem permissão para editar.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Post.findByPk(postId);
    return row!.toJSON() as PostDTO;
  }

  async deletePostById(postId: number): Promise<void> {
    await this.models.Post.destroy({ where: { id: postId } });
  }

  async listCommentsByPostId(
    postId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<CommentDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Comment.count({ where: { post_id: postId } }),
      this.models.Comment.findAll({
        where: { post_id: postId },
        attributes: ['id', 'post_id', 'author_id', 'author_type', 'content', 'created_at'],
        order: [['created_at', 'ASC']],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<CommentDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listLikesByPostId(
    postId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<LikeDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Like.count({ where: { post_id: postId } }),
      this.models.Like.findAll({
        where: { post_id: postId },
        attributes: ['id', 'post_id', 'author_id', 'author_type', 'created_at'],
        order: [['created_at', 'ASC']],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<LikeDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async studentBelongsToTrainer(studentId: string, trainerId: string): Promise<boolean> {
    const s = await this.models.Student.findOne({
      where: { id: studentId, trainer_id: trainerId },
    });
    return s !== null;
  }

  async createComment(input: CreateCommentInput): Promise<CommentDTO> {
    const row = await this.models.Comment.create({
      post_id: input.postId,
      author_id: input.authorId,
      author_type: input.authorType,
      content: input.content,
    });
    return row.toJSON() as CommentDTO;
  }

  async findCommentById(commentId: number): Promise<CommentDTO | null> {
    const row = await this.models.Comment.findByPk(commentId);
    return row ? (row.toJSON() as CommentDTO) : null;
  }

  async updateCommentByOwner(
    commentId: number,
    authorId: string,
    authorType: AuthorRole,
    patch: PatchCommentInput
  ): Promise<CommentDTO> {
    const [n] = await this.models.Comment.update(
      { content: patch.content },
      { where: { id: commentId, author_id: authorId, author_type: authorType } }
    );
    if (n === 0) {
      const err = new Error('Comentário não encontrado ou sem permissão para editar.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Comment.findByPk(commentId);
    return row!.toJSON() as CommentDTO;
  }

  async deleteCommentById(commentId: number): Promise<void> {
    await this.models.Comment.destroy({ where: { id: commentId } });
  }

  async addLike(postId: number, authorId: string, authorType: AuthorRole): Promise<boolean> {
    const existing = await this.models.Like.findOne({
      where: { post_id: postId, author_id: authorId, author_type: authorType },
    });
    if (existing) return false;
    await this.models.Like.create({
      post_id: postId,
      author_id: authorId,
      author_type: authorType,
    });
    return true;
  }

  async removeLike(postId: number, authorId: string, authorType: AuthorRole): Promise<void> {
    const n = await this.models.Like.destroy({
      where: { post_id: postId, author_id: authorId, author_type: authorType },
    });
    if (n === 0) {
      const err = new Error('Like não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
  }
}
