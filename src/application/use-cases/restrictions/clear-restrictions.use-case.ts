import type { IRestrictionsRepository, RestrictionActor } from '../../ports/restrictions.port';

export class ClearRestrictionsUseCase {
  constructor(private readonly restrictions: IRestrictionsRepository) {}

  execute(actor: RestrictionActor): Promise<number> {
    return this.restrictions.deleteAllByAuthor(actor);
  }
}
