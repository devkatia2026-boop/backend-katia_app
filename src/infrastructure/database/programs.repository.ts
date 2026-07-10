import type { DatabaseModels } from './models';
import type {
  CreateProgramInput,
  IProgramsRepository,
  PatchProgramInput,
  ProgramDTO,
  ProgramListFilters,
  ProgramPagedList,
  ProgramTypeCounts,
} from '../../application/ports/programs.port';
import { toPagedResult } from '../../application/parsing/pagination.parsing';
import { mergeProgramWhere } from './program-search';
import {
  appendWhere,
  buildProgramTypeCountWhere,
  buildProgramTypeFilterWhere,
} from './program-type-where';
import type { WhereOptions } from 'sequelize';

const ATTR = [
  'id',
  'name',
  'photo',
  'status',
  'type',
  'description',
  'level',
  'objective',
  'bother',
  'created_at',
] as const;

function buildProgramListWhere(filters?: ProgramListFilters): WhereOptions {
  let where: WhereOptions = filters?.activeOnly ? { status: true } : {};
  where = mergeProgramWhere(where, filters?.search);
  if (filters?.type) {
    where = appendWhere(where, buildProgramTypeFilterWhere(filters.type));
  }
  return where;
}

async function countProgramTypes(
  model: Pick<DatabaseModels, 'Program'>['Program'],
  where: WhereOptions
): Promise<ProgramTypeCounts> {
  const [casa, academia, casaAcademia] = await Promise.all([
    model.count({ where: buildProgramTypeCountWhere(where, 'casa') }),
    model.count({ where: buildProgramTypeCountWhere(where, 'academia') }),
    model.count({ where: buildProgramTypeCountWhere(where, 'ambos') }),
  ]);
  return {
    Casa: casa,
    Academia: academia,
    'Casa/Academia': casaAcademia,
  };
}

export class SequelizeProgramsRepository implements IProgramsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Program'>) {}

  async listPaged(
    page: number,
    pageSize: number,
    filters?: ProgramListFilters
  ): Promise<ProgramPagedList> {
    const offset = (page - 1) * pageSize;
    const where = buildProgramListWhere(filters);
    const [total, rows, typeCounts] = await Promise.all([
      this.models.Program.count({ where }),
      this.models.Program.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<ProgramDTO[]>,
      countProgramTypes(this.models.Program, where),
    ]);
    return {
      ...toPagedResult(rows, total, page, pageSize),
      typeCounts,
    };
  }

  async listActive(search?: string): Promise<ProgramDTO[]> {
    const where = mergeProgramWhere({ status: true }, search);
    const rows = await this.models.Program.findAll({
      attributes: [...ATTR],
      where,
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
    });
    return rows as ProgramDTO[];
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
      objective: input.objective,
      bother: input.bother,
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
