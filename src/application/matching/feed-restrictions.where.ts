import { Op, type WhereOptions } from 'sequelize';
import type { FeedExclusions } from '../ports/restrictions.port';

function appendAnd(base: WhereOptions, clause: WhereOptions): WhereOptions {
  if (Object.keys(base).length === 0) return clause;
  return { [Op.and]: [base, clause] };
}

export function buildPostFeedWhere(exclusions: FeedExclusions): WhereOptions {
  let where: WhereOptions = {};

  if (exclusions.postIds.length > 0) {
    where = appendAnd(where, { id: { [Op.notIn]: exclusions.postIds } });
  }

  const authorBlocks: WhereOptions[] = [];
  if (exclusions.studentIds.length > 0) {
    authorBlocks.push({
      author_type: 'student',
      author_id: { [Op.in]: exclusions.studentIds },
    });
  }
  if (exclusions.trainerIds.length > 0) {
    authorBlocks.push({
      author_type: 'trainer',
      author_id: { [Op.in]: exclusions.trainerIds },
    });
  }
  if (authorBlocks.length > 0) {
    where = appendAnd(where, { [Op.not]: { [Op.or]: authorBlocks } });
  }

  return where;
}

export function buildCommentsCountWhereForPosts(
  postIds: number[],
  exclusions: FeedExclusions
): WhereOptions {
  let where: WhereOptions = { post_id: { [Op.in]: postIds } };

  if (exclusions.commentIds.length > 0) {
    where = appendAnd(where, { id: { [Op.notIn]: exclusions.commentIds } });
  }

  const authorBlocks: WhereOptions[] = [];
  if (exclusions.studentIds.length > 0) {
    authorBlocks.push({
      author_type: 'student',
      author_id: { [Op.in]: exclusions.studentIds },
    });
  }
  if (exclusions.trainerIds.length > 0) {
    authorBlocks.push({
      author_type: 'trainer',
      author_id: { [Op.in]: exclusions.trainerIds },
    });
  }
  if (authorBlocks.length > 0) {
    where = appendAnd(where, { [Op.not]: { [Op.or]: authorBlocks } });
  }

  return where;
}

export function buildLikesFeedWhere(postId: number, exclusions: FeedExclusions): WhereOptions {
  let where: WhereOptions = { post_id: postId };

  const authorBlocks: WhereOptions[] = [];
  if (exclusions.studentIds.length > 0) {
    authorBlocks.push({
      author_type: 'student',
      author_id: { [Op.in]: exclusions.studentIds },
    });
  }
  if (exclusions.trainerIds.length > 0) {
    authorBlocks.push({
      author_type: 'trainer',
      author_id: { [Op.in]: exclusions.trainerIds },
    });
  }
  if (authorBlocks.length > 0) {
    where = appendAnd(where, { [Op.not]: { [Op.or]: authorBlocks } });
  }

  return where;
}

export function buildCommentFeedWhere(
  postId: number,
  exclusions: FeedExclusions
): WhereOptions {
  let where: WhereOptions = { post_id: postId };

  if (exclusions.commentIds.length > 0) {
    where = appendAnd(where, { id: { [Op.notIn]: exclusions.commentIds } });
  }

  const authorBlocks: WhereOptions[] = [];
  if (exclusions.studentIds.length > 0) {
    authorBlocks.push({
      author_type: 'student',
      author_id: { [Op.in]: exclusions.studentIds },
    });
  }
  if (exclusions.trainerIds.length > 0) {
    authorBlocks.push({
      author_type: 'trainer',
      author_id: { [Op.in]: exclusions.trainerIds },
    });
  }
  if (authorBlocks.length > 0) {
    where = appendAnd(where, { [Op.not]: { [Op.or]: authorBlocks } });
  }

  return where;
}

export function isPostExcludedByViewer(
  post: { id: number; author_id: string | null; author_type: string | null },
  exclusions: FeedExclusions
): boolean {
  if (exclusions.postIds.includes(post.id)) return true;
  if (post.author_id && post.author_type === 'student' && exclusions.studentIds.includes(post.author_id)) {
    return true;
  }
  if (post.author_id && post.author_type === 'trainer' && exclusions.trainerIds.includes(post.author_id)) {
    return true;
  }
  return false;
}

export function isCommentExcludedByViewer(
  comment: { id: number; author_id: string | null; author_type: string | null },
  exclusions: FeedExclusions
): boolean {
  if (exclusions.commentIds.includes(comment.id)) return true;
  if (
    comment.author_id &&
    comment.author_type === 'student' &&
    exclusions.studentIds.includes(comment.author_id)
  ) {
    return true;
  }
  if (
    comment.author_id &&
    comment.author_type === 'trainer' &&
    exclusions.trainerIds.includes(comment.author_id)
  ) {
    return true;
  }
  return false;
}
