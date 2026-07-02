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

export type FeedAuthor = {
  id: string | null;
  name: string;
  photo: string | null;
  type: AuthorRole | null;
  plan: string | null;
};

export type FeedViewer = {
  id: string;
  type: AuthorRole;
};

export type FeedPostDTO = PostDTO & {
  author: FeedAuthor;
  likes_count: number;
  comments_count: number;
  liked_by_me: boolean;
};

export type FeedCommentDTO = CommentDTO & {
  author: FeedAuthor;
};

export type FeedLikeDTO = LikeDTO & {
  author: FeedAuthor;
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
  /** Feed global: posts mais recentes primeiro, enriquecidos com autor e métricas. */
  listPosts(
    page: number,
    pageSize: number,
    viewer: FeedViewer
  ): Promise<PagedList<FeedPostDTO>>;
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
  ): Promise<PagedList<FeedCommentDTO>>;
  listLikesByPostId(
    postId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<FeedLikeDTO>>;
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
