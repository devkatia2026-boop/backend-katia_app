import type { Includeable, WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateContentInput,
  ContentDTO,
  ContentListFilters,
  IContentsRepository,
  PatchContentInput,
} from '../../application/ports/contents.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'introduction_id', 'link', 'type', 'created_at'] as const;

function buildWhere(filters?: ContentListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.introductionId !== undefined) {
    where.introduction_id = filters.introductionId;
  }
  return where;
}

export class SequelizeContentsRepository implements IContentsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Content' | 'Introduction' | 'Program'>
  ) {}

  private activeProgramInclude(): Includeable[] {
    return [
      {
        model: this.models.Introduction,
        as: 'introduction',
        attributes: [],
        required: true,
        include: [
          {
            model: this.models.Program,
            as: 'program',
            attributes: [],
            where: { status: true },
            required: true,
          },
        ],
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters?: ContentListFilters
  ): Promise<PagedList<ContentDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const include = filters?.activeProgramOnly ? this.activeProgramInclude() : undefined;

    const [total, rows] = await Promise.all([
      this.models.Content.count({ where, include, distinct: true }),
      this.models.Content.findAll({
        attributes: [...ATTR],
        where,
        include,
        order: [
          ['created_at', 'ASC'],
          ['id', 'ASC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<ContentDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(contentId: number): Promise<ContentDTO | null> {
    const row = await this.models.Content.findByPk(contentId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as ContentDTO) : null;
  }

  async create(input: CreateContentInput): Promise<ContentDTO> {
    const row = await this.models.Content.create(input);
    return row.get({ plain: true }) as ContentDTO;
  }

  async update(contentId: number, patch: PatchContentInput): Promise<ContentDTO> {
    const [n] = await this.models.Content.update(patch, { where: { id: contentId } });
    if (n === 0) {
      const err = new Error('Conteúdo não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Content.findByPk(contentId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as ContentDTO;
  }

  async deleteById(contentId: number): Promise<boolean> {
    const n = await this.models.Content.destroy({ where: { id: contentId } });
    return n > 0;
  }
}
