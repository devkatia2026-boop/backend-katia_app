import { col, fn } from 'sequelize';

import type { DatabaseModels } from './models';
import type {
  AuthorRole,
  CommentDTO,
  CreateCommentInput,
  CreatePostInput,
  FeedAuthor,
  FeedCommentDTO,
  FeedLikeDTO,
  FeedPostDTO,
  FeedViewer,
  ISocialFeedRepository,
  LikeDTO,
  PagedList,
  PatchCommentInput,
  PatchPostInput,
  PostDTO,
} from '../../application/ports/social-feed.port';

type AuthorRef = { author_id: string | null; author_type: string | null };

function authorKey(id: string, type: string): string {
  return `${type}:${id}`;
}

function resolveAuthor(
  map: Map<string, FeedAuthor>,
  id: string | null,
  type: string | null
): FeedAuthor {
  if (id && type) {
    const found = map.get(authorKey(id, type));
    if (found) return found;
  }
  return {
    id,
    name: 'Usuária',
    photo: null,
    type: (type as AuthorRole) ?? null,
    plan: null,
  };
}

export class SequelizeSocialFeedRepository implements ISocialFeedRepository {
  constructor(
    private readonly models: Pick<
      DatabaseModels,
      'Post' | 'Comment' | 'Like' | 'Student' | 'Trainer'
    >
  ) {}

  private async buildAuthorMap(refs: AuthorRef[]): Promise<Map<string, FeedAuthor>> {
    const studentIds = new Set<string>();
    const trainerIds = new Set<string>();

    for (const ref of refs) {
      if (!ref.author_id) continue;
      if (ref.author_type === 'trainer') trainerIds.add(ref.author_id);
      else if (ref.author_type === 'student') studentIds.add(ref.author_id);
    }

    const [students, trainers] = await Promise.all([
      studentIds.size > 0
        ? (this.models.Student.findAll({
            attributes: ['id', 'full_name', 'photo_perfil', 'type_plan'],
            where: { id: [...studentIds] },
            raw: true,
          }) as unknown as Promise<
            { id: string; full_name: string; photo_perfil: string | null; type_plan: string | null }[]
          >)
        : Promise.resolve([]),
      trainerIds.size > 0
        ? (this.models.Trainer.findAll({
            attributes: ['id', 'full_name', 'photo_perfil'],
            where: { id: [...trainerIds] },
            raw: true,
          }) as unknown as Promise<{ id: string; full_name: string; photo_perfil: string | null }[]>)
        : Promise.resolve([]),
    ]);

    const map = new Map<string, FeedAuthor>();

    for (const student of students) {
      map.set(authorKey(student.id, 'student'), {
        id: student.id,
        name: student.full_name,
        photo: student.photo_perfil,
        type: 'student',
        plan: student.type_plan,
      });
    }

    for (const trainer of trainers) {
      map.set(authorKey(trainer.id, 'trainer'), {
        id: trainer.id,
        name: trainer.full_name,
        photo: trainer.photo_perfil,
        type: 'trainer',
        plan: null,
      });
    }

    return map;
  }

  async createPost(input: CreatePostInput): Promise<PostDTO> {
    console.log('[posts] db insert', {
      authorId: input.authorId,
      authorType: input.authorType,
      hasContent: input.content !== null,
      hasImage: input.image !== null,
      imageUrl: input.image,
    });
    const row = await this.models.Post.create({
      author_id: input.authorId,
      author_type: input.authorType,
      content: input.content,
      image: input.image,
    });
    const post = row.toJSON() as PostDTO;
    console.log('[posts] db insert ok', { postId: post.id, image: post.image });
    return post;
  }

  async listPosts(
    page: number,
    pageSize: number,
    viewer: FeedViewer
  ): Promise<PagedList<FeedPostDTO>> {
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

    if (rows.length === 0) {
      return { items: [], total, page, pageSize };
    }

    const postIds = rows.map((row) => row.id);

    const [authorMap, likeRows, commentRows, myLikes] = await Promise.all([
      this.buildAuthorMap(rows),
      this.models.Like.findAll({
        attributes: ['post_id', [fn('COUNT', col('id')), 'count']],
        where: { post_id: postIds },
        group: ['post_id'],
        raw: true,
      }) as unknown as Promise<{ post_id: number; count: string | number }[]>,
      this.models.Comment.findAll({
        attributes: ['post_id', [fn('COUNT', col('id')), 'count']],
        where: { post_id: postIds },
        group: ['post_id'],
        raw: true,
      }) as unknown as Promise<{ post_id: number; count: string | number }[]>,
      this.models.Like.findAll({
        attributes: ['post_id'],
        where: { post_id: postIds, author_id: viewer.id, author_type: viewer.type },
        raw: true,
      }) as unknown as Promise<{ post_id: number }[]>,
    ]);

    const likeCountByPost = new Map<number, number>();
    for (const row of likeRows) likeCountByPost.set(row.post_id, Number(row.count));

    const commentCountByPost = new Map<number, number>();
    for (const row of commentRows) commentCountByPost.set(row.post_id, Number(row.count));

    const likedByMe = new Set<number>(myLikes.map((row) => row.post_id));

    const items: FeedPostDTO[] = rows.map((row) => ({
      ...row,
      author: resolveAuthor(authorMap, row.author_id, row.author_type),
      likes_count: likeCountByPost.get(row.id) ?? 0,
      comments_count: commentCountByPost.get(row.id) ?? 0,
      liked_by_me: likedByMe.has(row.id),
    }));

    return { items, total, page, pageSize };
  }

  async findPostById(postId: number): Promise<PostDTO | null> {
    const row = await this.models.Post.findByPk(postId);
    return row ? (row.toJSON() as PostDTO) : null;
  }

  async findFeedPostById(postId: number, viewer: FeedViewer): Promise<FeedPostDTO | null> {
    const row = (await this.models.Post.findByPk(postId, {
      attributes: ['id', 'author_id', 'author_type', 'image', 'content', 'created_at'],
      raw: true,
    })) as PostDTO | null;

    if (!row) {
      return null;
    }

    const [authorMap, likesCount, commentsCount, myLike] = await Promise.all([
      this.buildAuthorMap([row]),
      this.models.Like.count({ where: { post_id: postId } }),
      this.models.Comment.count({ where: { post_id: postId } }),
      this.models.Like.findOne({
        where: { post_id: postId, author_id: viewer.id, author_type: viewer.type },
        raw: true,
      }),
    ]);

    return {
      ...row,
      author: resolveAuthor(authorMap, row.author_id, row.author_type),
      likes_count: likesCount,
      comments_count: commentsCount,
      liked_by_me: myLike !== null,
    };
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
  ): Promise<PagedList<FeedCommentDTO>> {
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

    if (rows.length === 0) {
      return { items: [], total, page, pageSize };
    }

    const authorMap = await this.buildAuthorMap(rows);
    const items: FeedCommentDTO[] = rows.map((row) => ({
      ...row,
      author: resolveAuthor(authorMap, row.author_id, row.author_type),
    }));

    return { items, total, page, pageSize };
  }

  async listLikesByPostId(
    postId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<FeedLikeDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Like.count({ where: { post_id: postId } }),
      this.models.Like.findAll({
        where: { post_id: postId },
        attributes: ['id', 'post_id', 'author_id', 'author_type', 'created_at'],
        order: [['created_at', 'DESC']],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<LikeDTO[]>,
    ]);

    if (rows.length === 0) {
      return { items: [], total, page, pageSize };
    }

    const authorMap = await this.buildAuthorMap(rows);
    const items: FeedLikeDTO[] = rows.map((row) => ({
      ...row,
      author: resolveAuthor(authorMap, row.author_id, row.author_type),
    }));

    return { items, total, page, pageSize };
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
