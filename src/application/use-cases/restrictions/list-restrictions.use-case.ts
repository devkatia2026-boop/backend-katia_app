import type { IRestrictionsRepository, RestrictionActor, RestrictionDTO } from '../../ports/restrictions.port';
import type { IRestrictionTargetsLookup } from '../../ports/restriction-targets.port';
import type { ISocialFeedRepository } from '../../ports/social-feed.port';
import { enrichRestrictionDtos } from '../../restrictions/enrich-restriction-dto';

export class ListRestrictionsUseCase {
  constructor(
    private readonly restrictions: IRestrictionsRepository,
    private readonly feed: ISocialFeedRepository,
    private readonly targets: IRestrictionTargetsLookup
  ) {}

  async execute(actor: RestrictionActor): Promise<RestrictionDTO[]> {
    const items = await this.restrictions.listByAuthor(actor);
    return enrichRestrictionDtos(items, this.feed, this.targets);
  }
}
