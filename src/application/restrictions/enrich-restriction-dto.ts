import type { IRestrictionTargetsLookup } from '../ports/restriction-targets.port';
import type { RestrictionDTO } from '../ports/restrictions.port';
import type { CommentDTO, ISocialFeedRepository, PostDTO } from '../ports/social-feed.port';

type BlockedUser = {
  id: string;
  type: 'student' | 'trainer';
};

type FeedCache = {
  getPost(id: number): Promise<PostDTO | null>;
  getComment(id: number): Promise<CommentDTO | null>;
};

function trimPreview(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeAuthorType(value: string | null | undefined): 'student' | 'trainer' | null {
  if (value === 'student' || value === 'trainer') return value;
  return null;
}

function normalizeUuid(id: string | null | undefined): string | null {
  const t = id?.trim();
  if (!t) return null;
  return t.toLowerCase();
}

function createFeedCache(feed: ISocialFeedRepository): FeedCache {
  const posts = new Map<number, PostDTO | null>();
  const comments = new Map<number, CommentDTO | null>();

  return {
    async getPost(id: number): Promise<PostDTO | null> {
      if (!posts.has(id)) {
        posts.set(id, (await feed.findPostById(id)) ?? null);
      }
      return posts.get(id) ?? null;
    },
    async getComment(id: number): Promise<CommentDTO | null> {
      if (!comments.has(id)) {
        comments.set(id, (await feed.findCommentById(id)) ?? null);
      }
      return comments.get(id) ?? null;
    },
  };
}

async function resolveBlockedUser(
  item: RestrictionDTO,
  cache: FeedCache
): Promise<BlockedUser | null> {
  if (item.restriction_type === 'student') {
    const id = normalizeUuid(item.target_id);
    return id ? { id, type: 'student' } : null;
  }
  if (item.restriction_type === 'trainer') {
    const id = normalizeUuid(item.target_id);
    return id ? { id, type: 'trainer' } : null;
  }
  if (item.restriction_type === 'post' && item.post_id) {
    const post = await cache.getPost(item.post_id);
    const type = normalizeAuthorType(post?.author_type);
    const id = normalizeUuid(post?.author_id);
    if (!type || !id) return null;
    return { id, type };
  }
  if (item.restriction_type === 'comment' && item.comment_id) {
    const comment = await cache.getComment(item.comment_id);
    const type = normalizeAuthorType(comment?.author_type);
    const id = normalizeUuid(comment?.author_id);
    if (!type || !id) return null;
    return { id, type };
  }
  return null;
}

type ContentFields = {
  post_content: string | null;
  post_image: string | null;
  comment_content: string | null;
};

async function resolveContentFields(
  item: RestrictionDTO,
  cache: FeedCache
): Promise<ContentFields> {
  const empty: ContentFields = {
    post_content: null,
    post_image: null,
    comment_content: null,
  };

  if (item.restriction_type === 'post' && item.post_id) {
    const post = await cache.getPost(item.post_id);
    if (!post) return empty;
    return {
      post_content: trimPreview(post.content),
      post_image: trimPreview(post.image),
      comment_content: null,
    };
  }

  if (item.restriction_type === 'comment' && item.comment_id) {
    const comment = await cache.getComment(item.comment_id);
    if (!comment) return empty;
    return {
      post_content: null,
      post_image: null,
      comment_content: trimPreview(comment.content),
    };
  }

  return empty;
}

function applyEnrichment(
  item: RestrictionDTO,
  blocked: BlockedUser | null,
  blocked_name: string | null,
  content: ContentFields
): RestrictionDTO {
  return {
    ...item,
    content_type: trimPreview(item.content_type),
    blocked_user_id: blocked?.id ?? null,
    blocked_user_type: blocked?.type ?? null,
    blocked_name,
    post_content: content.post_content,
    post_image: content.post_image,
    comment_content: content.comment_content,
    subject_author_name: blocked_name,
    subject_author_type: blocked?.type ?? null,
  };
}

export async function enrichRestrictionDto(
  item: RestrictionDTO,
  feed: ISocialFeedRepository,
  targets: IRestrictionTargetsLookup
): Promise<RestrictionDTO> {
  const cache = createFeedCache(feed);
  const [blocked, content] = await Promise.all([
    resolveBlockedUser(item, cache),
    resolveContentFields(item, cache),
  ]);

  let blocked_name: string | null = null;
  if (blocked) {
    blocked_name = await targets.resolveDisplayName(blocked.type, blocked.id);
  }

  return applyEnrichment(item, blocked, blocked_name, content);
}

export async function enrichRestrictionDtos(
  items: RestrictionDTO[],
  feed: ISocialFeedRepository,
  targets: IRestrictionTargetsLookup
): Promise<RestrictionDTO[]> {
  if (items.length === 0) return [];

  const cache = createFeedCache(feed);

  const blockedByIndex: (BlockedUser | null)[] = await Promise.all(
    items.map((item) => resolveBlockedUser(item, cache))
  );

  const contentByIndex = await Promise.all(
    items.map((item) => resolveContentFields(item, cache))
  );

  const studentIds = new Set<string>();
  const trainerIds = new Set<string>();
  for (const u of blockedByIndex) {
    if (!u) continue;
    if (u.type === 'student') studentIds.add(u.id);
    else trainerIds.add(u.id);
  }

  const nameMap = await targets.resolveDisplayNameMap([...studentIds], [...trainerIds]);

  return items.map((item, i) => {
    const blocked = blockedByIndex[i];
    let blocked_name: string | null = null;
    if (blocked) {
      blocked_name = nameMap.get(`${blocked.type}:${blocked.id}`) ?? null;
    }
    return applyEnrichment(item, blocked, blocked_name, contentByIndex[i]);
  });
}
