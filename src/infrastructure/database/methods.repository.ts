import type { WhereOptions } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateMethodInput,
  IMethodsRepository,
  MethodDTO,
  MethodListFilters,
  PatchMethodInput,
} from '../../application/ports/methods.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'method_program_id', 'title', 'link', 'created_at'] as const;

function buildWhere(filters?: MethodListFilters): WhereOptions {
  const where: WhereOptions = {};
  if (filters?.methodProgramId !== undefined) {
    where.method_program_id = filters.methodProgramId;
  }
  return where;
}

export class SequelizeMethodsRepository implements IMethodsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Method' | 'MethodProgram'>
  ) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: MethodListFilters
  ): Promise<PagedList<MethodDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.Method.count({ where }),
      this.models.Method.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'ASC'],
          ['id', 'ASC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<MethodDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(id: number): Promise<MethodDTO | null> {
    const row = await this.models.Method.findByPk(id, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as MethodDTO) : null;
  }

  async methodProgramExists(methodProgramId: number): Promise<boolean> {
    const n = await this.models.MethodProgram.count({ where: { id: methodProgramId } });
    return n > 0;
  }

  async create(input: CreateMethodInput): Promise<MethodDTO> {
    const row = await this.models.Method.create(input);
    return row.get({ plain: true }) as MethodDTO;
  }

  async update(id: number, patch: PatchMethodInput): Promise<MethodDTO> {
    const [n] = await this.models.Method.update(patch, { where: { id } });
    if (n === 0) {
      const err = new Error('Método não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Method.findByPk(id, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as MethodDTO;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.Method.destroy({ where: { id } });
    return n > 0;
  }
}
