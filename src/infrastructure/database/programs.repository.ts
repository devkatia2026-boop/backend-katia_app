import type { DatabaseModels } from './models';
import type {
  CreateProgramInput,
  IProgramsRepository,
  PatchProgramInput,
  ProgramDTO,
} from '../../application/ports/programs.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'name', 'photo', 'status', 'type', 'description', 'level', 'created_at'] as const;

export class SequelizeProgramsRepository implements IProgramsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Program'>) {}

  async listPaged(page: number, pageSize: number): Promise<PagedList<ProgramDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Program.count(),
      this.models.Program.findAll({
        attributes: [...ATTR],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<ProgramDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(programId: number): Promise<ProgramDTO | null> {
    const row = await this.models.Program.findByPk(programId, { attributes: [...ATTR], raw: true });
    return row ? (row as ProgramDTO) : null;
  }

  async create(input: CreateProgramInput): Promise<ProgramDTO> {
    const row = await this.models.Program.create({
      name: input.name,
      photo: input.photo,
      status: input.status,
      type: input.type,
      description: input.description,
      level: input.level,
    });
    return row.get({ plain: true }) as ProgramDTO;
  }

  async update(programId: number, patch: PatchProgramInput): Promise<ProgramDTO> {
    const [n] = await this.models.Program.update(patch, { where: { id: programId } });
    if (n === 0) {
      const err = new Error('Programa não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.models.Program.findByPk(programId, { attributes: [...ATTR] });
    return row!.get({ plain: true }) as ProgramDTO;
  }

  async deleteById(programId: number): Promise<boolean> {
    const n = await this.models.Program.destroy({ where: { id: programId } });
    return n > 0;
  }
}
