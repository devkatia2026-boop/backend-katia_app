import type { DatabaseModels } from './models';
import type {
  CreateTrainingToProgramInput,
  ITrainingsToProgramsRepository,
  ListTrainingsToProgramsFilters,
  TrainingToProgramDTO,
  TrainingToProgramProgram,
  TrainingToProgramTraining,
} from '../../application/ports/trainings-to-programs.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'program_id', 'training_id', 'created_at'] as const;
const PROGRAM_ATTR = [
  'id',
  'name',
  'photo',
  'status',
  'type',
  'description',
  'level',
  'created_at',
] as const;
const TRAINING_ATTR = ['id', 'lyric', 'description', 'time', 'type', 'created_at'] as const;

function buildWhere(filters: ListTrainingsToProgramsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.programId !== undefined) where.program_id = filters.programId;
  if (filters.trainingId !== undefined) where.training_id = filters.trainingId;
  return where;
}

export class SequelizeTrainingsToProgramsRepository implements ITrainingsToProgramsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'TrainingsToPrograms' | 'Program' | 'Training'>
  ) {}

  private get includeOpts() {
    return [
      { model: this.models.Program, as: 'program', attributes: [...PROGRAM_ATTR], required: false },
      {
        model: this.models.Training,
        as: 'training',
        attributes: [...TRAINING_ATTR],
        required: false,
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters: ListTrainingsToProgramsFilters
  ): Promise<PagedList<TrainingToProgramDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.TrainingsToPrograms.count({ where }),
      this.models.TrainingsToPrograms.findAll({
        attributes: [...ATTR],
        where,
        include: this.includeOpts,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<TrainingToProgramDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listTrainingsByProgram(
    programId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<TrainingToProgramTraining>> {
    const offset = (page - 1) * pageSize;
    const where = { program_id: programId };
    const [total, rows] = await Promise.all([
      this.models.TrainingsToPrograms.count({ where }),
      this.models.TrainingsToPrograms.findAll({
        attributes: [],
        where,
        include: [
          {
            model: this.models.Training,
            as: 'training',
            attributes: [...TRAINING_ATTR],
            required: true,
          },
        ],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<Array<{ training: TrainingToProgramTraining }>>,
    ]);
    return { items: rows.map((r) => r.training), total, page, pageSize };
  }

  async listProgramsByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<TrainingToProgramProgram>> {
    const offset = (page - 1) * pageSize;
    const where = { training_id: trainingId };
    const [total, rows] = await Promise.all([
      this.models.TrainingsToPrograms.count({ where }),
      this.models.TrainingsToPrograms.findAll({
        attributes: [],
        where,
        include: [
          {
            model: this.models.Program,
            as: 'program',
            attributes: [...PROGRAM_ATTR],
            required: true,
          },
        ],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<Array<{ program: TrainingToProgramProgram }>>,
    ]);
    return { items: rows.map((r) => r.program), total, page, pageSize };
  }

  findById(id: number): Promise<TrainingToProgramDTO | null> {
    return this.models.TrainingsToPrograms.findByPk(id, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    }) as unknown as Promise<TrainingToProgramDTO | null>;
  }

  async create(input: CreateTrainingToProgramInput): Promise<TrainingToProgramDTO> {
    const created = await this.models.TrainingsToPrograms.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as TrainingToProgramDTO;
  }
}
