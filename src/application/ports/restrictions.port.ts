import type { AuthorRole } from './social-feed.port';

export type RestrictionType = 'student' | 'trainer' | 'post' | 'comment';

export type RestrictionAuthorType = AuthorRole;

export type RestrictionDTO = {
  id: string;
  author_id: string;
  author_type: string;
  restriction_type: string;
  target_id: string | null;
  target_type: string | null;
  post_id: number | null;
  comment_id: number | null;
  content_type: string | null;
  blocked_user_id?: string | null;
  blocked_user_type?: 'student' | 'trainer' | null;
  blocked_name?: string | null;
  post_content?: string | null;
  post_image?: string | null;
  comment_content?: string | null;
  subject_author_name?: string | null;
  subject_author_type?: 'student' | 'trainer' | null;
  created_at: Date;
};

export type CreateRestrictionInput = {
  author_id: string;
  author_type: RestrictionAuthorType;
  restriction_type: RestrictionType;
  target_id?: string | null;
  target_type?: 'student' | 'trainer' | null;
  post_id?: number | null;
  comment_id?: number | null;
  content_type?: string | null;
};

export type FeedExclusions = {
  postIds: number[];
  commentIds: number[];
  studentIds: string[];
  trainerIds: string[];
};

export type RestrictionActor = {
  id: string;
  type: RestrictionAuthorType;
};

export interface IRestrictionsRepository {
  create(input: CreateRestrictionInput): Promise<RestrictionDTO>;
  findByIdForAuthor(restrictionId: string, author: RestrictionActor): Promise<RestrictionDTO | null>;
  listByAuthor(author: RestrictionActor): Promise<RestrictionDTO[]>;
  deleteByIdForAuthor(restrictionId: string, author: RestrictionActor): Promise<boolean>;
  deleteAllByAuthor(author: RestrictionActor): Promise<number>;
  loadFeedExclusions(viewer: RestrictionActor): Promise<FeedExclusions>;
  findDuplicate(input: CreateRestrictionInput): Promise<RestrictionDTO | null>;
}
