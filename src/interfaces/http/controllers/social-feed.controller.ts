import type { Request, Response } from 'express';
import type { AuthorRole } from '../../../application/ports/social-feed.port';
import type { CreatePostUseCase } from '../../../application/use-cases/social/create-post.use-case';
import type { UpdatePostUseCase } from '../../../application/use-cases/social/update-post.use-case';
import type { DeletePostUseCase } from '../../../application/use-cases/social/delete-post.use-case';
import type { CreateCommentUseCase } from '../../../application/use-cases/social/create-comment.use-case';
import type { UpdateCommentUseCase } from '../../../application/use-cases/social/update-comment.use-case';
import type { DeleteCommentUseCase } from '../../../application/use-cases/social/delete-comment.use-case';
import type { LikePostUseCase } from '../../../application/use-cases/social/like-post.use-case';
import type { UnlikePostUseCase } from '../../../application/use-cases/social/unlike-post.use-case';
import type { ListPostCommentsUseCase } from '../../../application/use-cases/social/list-post-comments.use-case';
import type { ListPostLikesUseCase } from '../../../application/use-cases/social/list-post-likes.use-case';
import type { ListPostsUseCase } from '../../../application/use-cases/social/list-posts.use-case';
import {
  OBJECT_STORAGE_EXCEPTION,
  type UploadImageFilesUseCase,
} from '../../../application/use-cases/media/upload-image-files.use-case';
import {
  POST_IMAGE_FIELDS,
  S3_PREFIX_POST,
} from '../../../application/media/image-upload.config';
import { mergeImageUploadsIntoBody } from '../helpers/merge-image-uploads';
import { isMultipartRequest } from '../parsing/image-multipart.parsing';

const VALIDATION = 'ValidationException';
const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

function firstParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveInt(raw: string | undefined, label: string): number {
  const v = raw?.trim() ?? '';
  const n = parseInt(v, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${label} inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

function actor(req: Request): { id: string; role: AuthorRole } {
  return { id: req.authUser!.sub, role: req.authUser!.role as AuthorRole };
}

export class SocialFeedController {
  constructor(
    private readonly listPosts: ListPostsUseCase,
    private readonly createPost: CreatePostUseCase,
    private readonly updatePost: UpdatePostUseCase,
    private readonly deletePost: DeletePostUseCase,
    private readonly createComment: CreateCommentUseCase,
    private readonly updateComment: UpdateCommentUseCase,
    private readonly deleteComment: DeleteCommentUseCase,
    private readonly likePost: LikePostUseCase,
    private readonly unlikePost: UnlikePostUseCase,
    private readonly listPostComments: ListPostCommentsUseCase,
    private readonly listPostLikes: ListPostLikesUseCase,
    private readonly uploadImages: UploadImageFilesUseCase
  ) {}

  async postList(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const result = await this.listPosts.execute(
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize),
        { id: a.id, type: a.role }
      );
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar posts.');
    }
  }

  async postCreate(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      console.log('[posts] create iniciado', {
        authorId: a.id,
        authorRole: a.role,
        multipart: isMultipartRequest(req),
        contentType: req.headers['content-type'] ?? null,
      });
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        a.id,
        S3_PREFIX_POST,
        POST_IMAGE_FIELDS
      );
      console.log('[posts] create corpo', {
        authorId: a.id,
        hasContent: typeof body.content === 'string' && body.content.trim().length > 0,
        hasImage: typeof body.image === 'string' && body.image.trim().length > 0,
        imageUrl: typeof body.image === 'string' ? body.image : null,
      });
      const created = await this.createPost.execute(a.id, a.role, body);
      console.log('[posts] create ok', {
        postId: created.id,
        image: created.image,
        hasContent: created.content !== null && created.content.trim().length > 0,
      });
      res.status(201).json(created);
    } catch (err) {
      console.error('[posts] create falhou:', err);
      this.handle(err, res, 'Erro ao criar post.');
    }
  }

  async postPatch(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const body = await mergeImageUploadsIntoBody(
        req,
        this.uploadImages,
        a.id,
        S3_PREFIX_POST,
        POST_IMAGE_FIELDS
      );
      const updated = await this.updatePost.execute(a.id, a.role, postId, body);
      res.status(200).json(updated);
    } catch (err) {
      this.handle(err, res, 'Erro ao atualizar post.');
    }
  }

  async postDelete(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      await this.deletePost.execute(a.id, a.role, postId);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao excluir post.');
    }
  }

  async commentList(req: Request, res: Response): Promise<void> {
    try {
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const result = await this.listPostComments.execute(
        postId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar comentários.');
    }
  }

  async likeList(req: Request, res: Response): Promise<void> {
    try {
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const result = await this.listPostLikes.execute(
        postId,
        firstQuery(req.query.page),
        firstQuery(req.query.pageSize)
      );
      res.status(200).json(result);
    } catch (err) {
      this.handle(err, res, 'Erro ao listar curtidas.');
    }
  }

  async commentCreate(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const created = await this.createComment.execute(a.id, a.role, postId, req.body);
      res.status(201).json(created);
    } catch (err) {
      this.handle(err, res, 'Erro ao criar comentário.');
    }
  }

  async commentPatch(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const commentId = parsePositiveInt(firstParam(req.params.commentId), 'commentId');
      const updated = await this.updateComment.execute(a.id, a.role, postId, commentId, req.body);
      res.status(200).json(updated);
    } catch (err) {
      this.handle(err, res, 'Erro ao atualizar comentário.');
    }
  }

  async commentDelete(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      const commentId = parsePositiveInt(firstParam(req.params.commentId), 'commentId');
      await this.deleteComment.execute(a.id, a.role, postId, commentId);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao excluir comentário.');
    }
  }

  async likeAdd(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      await this.likePost.execute(a.id, a.role, postId);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao curtir post.');
    }
  }

  async likeRemove(req: Request, res: Response): Promise<void> {
    try {
      const a = actor(req);
      const postId = parsePositiveInt(firstParam(req.params.postId), 'postId');
      await this.unlikePost.execute(a.id, a.role, postId);
      res.status(204).end();
    } catch (err) {
      this.handle(err, res, 'Erro ao remover curtida.');
    }
  }

  private handle(err: unknown, res: Response, fallback: string): void {
    const error = err as { name?: string; message?: string };
    if (error.name === OBJECT_STORAGE_EXCEPTION) {
      res.status(503).json({ message: error.message ?? 'Armazenamento indisponível.' });
      return;
    }
    if (error.name === VALIDATION) {
      res.status(400).json({ message: error.message ?? 'Dados inválidos.' });
      return;
    }
    if (error.name === NOT_FOUND) {
      res.status(404).json({ message: error.message ?? 'Não encontrado.' });
      return;
    }
    if (error.name === FORBIDDEN) {
      res.status(403).json({ message: error.message ?? 'Sem permissão.' });
      return;
    }
    res.status(500).json({ message: fallback });
  }
}
