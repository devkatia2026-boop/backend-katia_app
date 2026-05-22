export type AuthorRole = 'student' | 'trainer';

export type PostDTO = {
  id: number;
  author_id: string | null;
  author_type: string | null;
  image: string | null;
  content: string | null;
  created_at: Date;
};

export type CommentDTO = {
  id: number;
  post_id: number;
  author_id: string | null;
  author_type: string | null;
  content: string | null;
  created_at: Date;
};

export type LikeDTO = {
  id: number;
  post_id: number;
  author_id: string | null;
  author_type: string | null;
  created_at: Date;
};

export type PagedList<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreatePostInput = {
  authorId: string;
  authorType: AuthorRole;
  content: string | null;
  image: string | null;
};

export type PatchPostInput = {
  content?: string | null;
  image?: string | null;
};

export type CreateCommentInput = {
  postId: number;
  authorId: string;
  authorType: AuthorRole;
  content: string;
};

export type PatchCommentInput = {
  content: string;
};

export interface ISocialFeedRepository {
  createPost(input: CreatePostInput): Promise<PostDTO>;
  /** Feed global: posts mais recentes primeiro. */
  listPosts(page: number, pageSize: number): Promise<PagedList<PostDTO>>;
  findPostById(postId: number): Promise<PostDTO | null>;
  updatePostByOwner(
    postId: number,
    authorId: string,
    authorType: AuthorRole,
    patch: PatchPostInput
  ): Promise<PostDTO>;
  deletePostById(postId: number): Promise<void>;
  studentBelongsToTrainer(studentId: string, trainerId: string): Promise<boolean>;
  listCommentsByPostId(
    postId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<CommentDTO>>;
  listLikesByPostId(postId: number, page: number, pageSize: number): Promise<PagedList<LikeDTO>>;
  createComment(input: CreateCommentInput): Promise<CommentDTO>;
  findCommentById(commentId: number): Promise<CommentDTO | null>;
  updateCommentByOwner(
    commentId: number,
    authorId: string,
    authorType: AuthorRole,
    patch: PatchCommentInput
  ): Promise<CommentDTO>;
  deleteCommentById(commentId: number): Promise<void>;
  /** @returns true se o like foi criado; false se já existia. */
  addLike(postId: number, authorId: string, authorType: AuthorRole): Promise<boolean>;
  removeLike(postId: number, authorId: string, authorType: AuthorRole): Promise<void>;
}
