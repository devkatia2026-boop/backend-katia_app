import type { DatabaseModels } from './models';
import type {
  CreateSetInput,
  ISetsRepository,
  PatchSetInput,
  SetDTO,
} from '../../application/ports/sets.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'name', 'order', 'created_at'] as const;

export class SequelizeSetsRepository implements ISetsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Set'>) {}

  async listPaged(page: number, pageSize: number): Promise<PagedList<SetDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Set.count(),
      this.models.Set.findAll({
        attributes: [...ATTR],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<SetDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(setId: number): Promise<SetDTO | null> {
    const row = await this.models.Set.findByPk(setId, {
      attributes: [...ATTR],
      raw: true,
    });
    return row ? (row as SetDTO) : null;
  }

  async create(input: CreateSetInput): Promise<SetDTO> {
    const row = await this.models.Set.create({
      name: input.name,
      order: input.order,
    });
    return row.get({ plain: true }) as SetDTO;
  }

  async update(setId: number, patch: PatchSetInput): Promise<SetDTO> {
    const [n] = await this.models.Set.update(patch, { where: { id: setId } });
    if (n === 0) {
      const err = new Error('Set não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Set.findByPk(setId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as SetDTO;
  }

  async deleteById(setId: number): Promise<boolean> {
    const n = await this.models.Set.destroy({ where: { id: setId } });
    return n > 0;
  }
}
