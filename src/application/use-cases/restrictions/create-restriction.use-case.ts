import { parseRestrictionCreateBody } from '../../parsing/restriction-body.parsing';
import type { RestrictionActor, IRestrictionsRepository, RestrictionDTO } from '../../ports/restrictions.port';
import type { ISocialFeedRepository } from '../../ports/social-feed.port';
import type { IRestrictionTargetsLookup } from '../../ports/restriction-targets.port';
import { enrichRestrictionDto } from '../../restrictions/enrich-restriction-dto';

const NOT_FOUND = 'NotFoundException';
const VALIDATION = 'ValidationException';

export class CreateRestrictionUseCase {
  constructor(
    private readonly restrictions: IRestrictionsRepository,
    private readonly feed: ISocialFeedRepository,
    private readonly targets: IRestrictionTargetsLookup
  ) {}

  async execute(body: unknown, actor: RestrictionActor): Promise<RestrictionDTO> {
    const input = parseRestrictionCreateBody(body, actor.id, actor.type);

    if (input.restriction_type === 'student' || input.restriction_type === 'trainer') {
      if (input.target_id === actor.id && input.target_type === actor.type) {
        const err = new Error('Não é possível bloquear a si mesma.');
        err.name = VALIDATION;
        throw err;
      }
      await this.assertUserExists(input.target_id!, input.target_type!);
    }

    if (input.restriction_type === 'post') {
      const post = await this.feed.findPostById(input.post_id!);
      if (!post) {
        const err = new Error('Post não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }

    if (input.restriction_type === 'comment') {
      const comment = await this.feed.findCommentById(input.comment_id!);
      if (!comment) {
        const err = new Error('Comentário não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }

    const existing = await this.restrictions.findDuplicate(input);
    if (existing) {
      return enrichRestrictionDto(existing, this.feed, this.targets);
    }

    const created = await this.restrictions.create(input);
    return enrichRestrictionDto(created, this.feed, this.targets);
  }

  private async assertUserExists(userId: string, userType: string): Promise<void> {
    if (userType === 'student') {
      if (!(await this.targets.studentExists(userId))) {
        const err = new Error('Aluna não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      return;
    }
    if (userType === 'trainer') {
      if (!(await this.targets.trainerExists(userId))) {
        const err = new Error('Treinadora não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      return;
    }
    const err = new Error('target_type inválido.');
    err.name = VALIDATION;
    throw err;
  }
}
