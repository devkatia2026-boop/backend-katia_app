import type { DatabaseModels } from './models';
import type {
  IMethodProgramsRepository,
  MethodProgramDTO,
  PatchMethodProgramInput,
} from '../../application/ports/method-programs.port';

const ATTR = ['id', 'description', 'created_at'] as const;

function toDto(raw: MethodProgramDTO): MethodProgramDTO {
  return {
    id: raw.id,
    description: raw.description,
    created_at: raw.created_at,
  };
}

export class SequelizeMethodProgramsRepository implements IMethodProgramsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'MethodProgram'>) {}

  async findById(id: number): Promise<MethodProgramDTO | null> {
    const row = await this.models.MethodProgram.findByPk(id, {
      attributes: [...ATTR],
      raw: true,
    });

    if (!row) {
      return null;
    }

    return toDto(row as MethodProgramDTO);
  }

  async update(id: number, patch: PatchMethodProgramInput): Promise<MethodProgramDTO> {
    const [affected] = await this.models.MethodProgram.update(patch, { where: { id } });

    if (affected === 0) {
      const err = new Error('Conteúdo de métodos não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }

    const row = await this.findById(id);
    return row as MethodProgramDTO;
  }
}
