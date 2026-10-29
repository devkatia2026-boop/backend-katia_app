import type { IRestrictionsRepository, RestrictionActor } from '../../ports/restrictions.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteRestrictionUseCase {
  constructor(private readonly restrictions: IRestrictionsRepository) {}

  async execute(restrictionId: string, actor: RestrictionActor): Promise<void> {
    const ok = await this.restrictions.deleteByIdForAuthor(restrictionId, actor);
    if (!ok) {
      const err = new Error('Restrição não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
