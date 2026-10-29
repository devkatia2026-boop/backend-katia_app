import { Op, type WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateRestrictionInput,
  FeedExclusions,
  IRestrictionsRepository,
  RestrictionActor,
  RestrictionDTO,
} from '../../application/ports/restrictions.port';

const ATTR = [
  'id',
  'author_id',
  'author_type',
  'restriction_type',
  'target_id',
  'target_type',
  'post_id',
  'comment_id',
  'content_type',
  'created_at',
] as const;

function emptyExclusions(): FeedExclusions {
  return { postIds: [], commentIds: [], studentIds: [], trainerIds: [] };
}

export class SequelizeRestrictionsRepository implements IRestrictionsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Restriction'>) {}

  async create(input: CreateRestrictionInput): Promise<RestrictionDTO> {
    const row = await this.models.Restriction.create(input);
    return row.get({ plain: true }) as RestrictionDTO;
  }

  async findByIdForAuthor(
    restrictionId: string,
    author: RestrictionActor
  ): Promise<RestrictionDTO | null> {
    const row = await this.models.Restriction.findOne({
      where: { id: restrictionId, author_id: author.id, author_type: author.type },
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as RestrictionDTO) : null;
  }

  async listByAuthor(author: RestrictionActor): Promise<RestrictionDTO[]> {
    const rows = await this.models.Restriction.findAll({
      where: { author_id: author.id, author_type: author.type },
      attributes: [...ATTR],
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
    });
    return rows as RestrictionDTO[];
  }

  async deleteByIdForAuthor(restrictionId: string, author: RestrictionActor): Promise<boolean> {
    const n = await this.models.Restriction.destroy({
      where: { id: restrictionId, author_id: author.id, author_type: author.type },
    });
    return n > 0;
  }

  async deleteAllByAuthor(author: RestrictionActor): Promise<number> {
    return this.models.Restriction.destroy({
      where: { author_id: author.id, author_type: author.type },
    });
  }

  async loadFeedExclusions(viewer: RestrictionActor): Promise<FeedExclusions> {
    const rows = await this.models.Restriction.findAll({
      where: { author_id: viewer.id, author_type: viewer.type },
      attributes: [
        'restriction_type',
        'target_id',
        'target_type',
        'post_id',
        'comment_id',
      ],
      raw: true,
    }) as Pick<
      RestrictionDTO,
      'restriction_type' | 'target_id' | 'target_type' | 'post_id' | 'comment_id'
    >[];

    if (rows.length === 0) return emptyExclusions();

    const postIds = new Set<number>();
    const commentIds = new Set<number>();
    const studentIds = new Set<string>();
    const trainerIds = new Set<string>();

    for (const row of rows) {
      switch (row.restriction_type) {
        case 'post':
          if (row.post_id != null) postIds.add(row.post_id);
          break;
        case 'comment':
          if (row.comment_id != null) commentIds.add(row.comment_id);
          break;
        case 'student':
          if (row.target_id) studentIds.add(row.target_id);
          break;
        case 'trainer':
          if (row.target_id) trainerIds.add(row.target_id);
          break;
        default:
          break;
      }
    }

    return {
      postIds: [...postIds],
      commentIds: [...commentIds],
      studentIds: [...studentIds],
      trainerIds: [...trainerIds],
    };
  }

  async findDuplicate(input: CreateRestrictionInput): Promise<RestrictionDTO | null> {
    const where: WhereOptions = {
      author_id: input.author_id,
      author_type: input.author_type,
      restriction_type: input.restriction_type,
    };

    if (input.restriction_type === 'post') {
      where.post_id = input.post_id ?? null;
    } else if (input.restriction_type === 'comment') {
      where.comment_id = input.comment_id ?? null;
    } else {
      where.target_id = input.target_id ?? null;
      where.target_type = input.target_type ?? null;
    }

    const row = await this.models.Restriction.findOne({
      where,
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as RestrictionDTO) : null;
  }
}
