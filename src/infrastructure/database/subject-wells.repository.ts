import type { WhereOptions } from 'sequelize';
import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateSubjectWellInput,
  ISubjectWellsRepository,
  PatchSubjectWellInput,
  SubjectWellDTO,
  SubjectWellListFilters,
} from '../../application/ports/subject-wells.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'well_id', 'midia', 'type', 'created_at'] as const;

function buildWhere(filters?: SubjectWellListFilters): WhereOptions {
  const where: WhereOptions = {};

  if (filters?.wellId !== undefined) {
    where.well_id = filters.wellId;
  }

  return where;
}

export class SequelizeSubjectWellsRepository implements ISubjectWellsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'SubjectWell'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: SubjectWellListFilters
  ): Promise<PagedList<SubjectWellDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);

    const [total, rows] = await Promise.all([
      this.models.SubjectWell.count({ where }),
      this.models.SubjectWell.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'ASC'],
          ['id', 'ASC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<SubjectWellDTO[]>,
    ]);

    return { items: rows, total, page, pageSize };
  }

  async findByWellIds(wellIds: number[]): Promise<SubjectWellDTO[]> {
    if (wellIds.length === 0) {
      return [];
    }

    const rows = await this.models.SubjectWell.findAll({
      attributes: [...ATTR],
      where: { well_id: { [Op.in]: wellIds } },
      order: [
        ['created_at', 'ASC'],
        ['id', 'ASC'],
      ],
      raw: true,
    });

    return rows as SubjectWellDTO[];
  }

  async findById(subjectWellId: number): Promise<SubjectWellDTO | null> {
    const row = await this.models.SubjectWell.findByPk(subjectWellId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as SubjectWellDTO) : null;
  }

  async create(input: CreateSubjectWellInput): Promise<SubjectWellDTO> {
    const row = await this.models.SubjectWell.create(input);
    return row.get({ plain: true }) as SubjectWellDTO;
  }

  async update(subjectWellId: number, patch: PatchSubjectWellInput): Promise<SubjectWellDTO> {
    const [n] = await this.models.SubjectWell.update(patch, { where: { id: subjectWellId } });

    if (n === 0) {
      const err = new Error('Mídia do conteúdo não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }

    const row = await this.models.SubjectWell.findByPk(subjectWellId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as SubjectWellDTO;
  }

  async deleteById(subjectWellId: number): Promise<boolean> {
    const n = await this.models.SubjectWell.destroy({ where: { id: subjectWellId } });
    return n > 0;
  }
}