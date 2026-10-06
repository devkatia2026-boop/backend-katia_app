import type { Includeable, WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateIntroductionInput,
  IIntroductionsRepository,
  IntroductionDTO,
  IntroductionListFilters,
  PatchIntroductionInput,
} from '../../application/ports/introductions.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'program_id', 'title', 'description', 'created_at'] as const;

function buildWhere(filters?: IntroductionListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.programId !== undefined) {
    where.program_id = filters.programId;
  }
  return where;
}

export class SequelizeIntroductionsRepository implements IIntroductionsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Introduction' | 'Program'>
  ) {}

  private programInclude(required: boolean): Includeable {
    return {
      model: this.models.Program,
      as: 'program',
      attributes: [],
      where: required ? { status: true } : undefined,
      required,
    };
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters?: IntroductionListFilters
  ): Promise<PagedList<IntroductionDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const include = filters?.activeProgramOnly ? [this.programInclude(true)] : undefined;

    const [total, rows] = await Promise.all([
      this.models.Introduction.count({ where, include, distinct: true }),
      this.models.Introduction.findAll({
        attributes: [...ATTR],
        where,
        include,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<IntroductionDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(introductionId: number): Promise<IntroductionDTO | null> {
    const row = await this.models.Introduction.findByPk(introductionId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as IntroductionDTO) : null;
  }

  async create(input: CreateIntroductionInput): Promise<IntroductionDTO> {
    const row = await this.models.Introduction.create(input);
    return row.get({ plain: true }) as IntroductionDTO;
  }

  async update(introductionId: number, patch: PatchIntroductionInput): Promise<IntroductionDTO> {
    const [n] = await this.models.Introduction.update(patch, { where: { id: introductionId } });
    if (n === 0) {
      const err = new Error('Introdução não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Introduction.findByPk(introductionId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as IntroductionDTO;
  }

  async deleteById(introductionId: number): Promise<boolean> {
    const n = await this.models.Introduction.destroy({ where: { id: introductionId } });
    return n > 0;
  }
}
