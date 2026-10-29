import type { FeedExclusions } from '../../ports/restrictions.port';
import type { IRestrictionsRepository, RestrictionActor } from '../../ports/restrictions.port';
import type { FeedViewer } from '../../ports/social-feed.port';

export function viewerToRestrictionActor(viewer: FeedViewer): RestrictionActor {
  return { id: viewer.id, type: viewer.type };
}

export function loadFeedExclusions(
  restrictions: IRestrictionsRepository,
  viewer: FeedViewer
): Promise<FeedExclusions> {
  return restrictions.loadFeedExclusions(viewerToRestrictionActor(viewer));
}
