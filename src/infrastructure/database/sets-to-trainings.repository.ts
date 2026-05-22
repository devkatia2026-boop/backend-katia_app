import type { DatabaseModels } from './models';
import type {
  CreateSetToTrainingInput,
  ISetsToTrainingsRepository,
  ListSetsToTrainingsFilters,
  PatchSetToTrainingInput,
  SetToTrainingDTO,
  SetToTrainingSet,
  SetToTrainingTraining,
} from '../../application/ports/sets-to-trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'training_id', 'set_id', 'created_at'] as const;
const TRAINING_ATTR = ['id', 'lyric', 'description', 'created_at'] as const;
const SET_ATTR = ['id', 'name', 'order', 'created_at'] as const;

function buildWhere(filters: ListSetsToTrainingsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.trainingId !== undefined) where.training_id = filters.trainingId;
  if (filters.setId !== undefined) where.set_id = filters.setId;
  return where;
}

export class SequelizeSetsToTrainingsRepository implements ISetsToTrainingsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'SetsToTrainings' | 'Training' | 'Set'>
  ) {}

  private get includeOpts() {
    return [
      {
        model: this.models.Training,
        as: 'training',
        attributes: [...TRAINING_ATTR],
        required: false,
      },
      {
        model: this.models.Set,
        as: 'set',
        attributes: [...SET_ATTR],
        required: false,
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters: ListSetsToTrainingsFilters
  ): Promise<PagedList<SetToTrainingDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.SetsToTrainings.count({ where }),
      this.models.SetsToTrainings.findAll({
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
      }) as unknown as Promise<SetToTrainingDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listSetsByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToTrainingSet>> {
    const offset = (page - 1) * pageSize;
    const where = { training_id: trainingId };
    const [total, rows] = await Promise.all([
      this.models.SetsToTrainings.count({ where }),
      this.models.SetsToTrainings.findAll({
        attributes: [],
        where,
        include: [
          {
            model: this.models.Set,
            as: 'set',
            attributes: [...SET_ATTR],
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
      }) as unknown as Promise<Array<{ set: SetToTrainingSet }>>,
    ]);
    return { items: rows.map((r) => r.set), total, page, pageSize };
  }

  async listTrainingsBySet(
    setId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToTrainingTraining>> {
    const offset = (page - 1) * pageSize;
    const where = { set_id: setId };
    const [total, rows] = await Promise.all([
      this.models.SetsToTrainings.count({ where }),
      this.models.SetsToTrainings.findAll({
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
      }) as unknown as Promise<Array<{ training: SetToTrainingTraining }>>,
    ]);
    return { items: rows.map((r) => r.training), total, page, pageSize };
  }

  findById(id: number): Promise<SetToTrainingDTO | null> {
    return this.models.SetsToTrainings.findByPk(id, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    }) as unknown as Promise<SetToTrainingDTO | null>;
  }

  async create(input: CreateSetToTrainingInput): Promise<SetToTrainingDTO> {
    const created = await this.models.SetsToTrainings.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as SetToTrainingDTO;
  }

  async update(id: number, patch: PatchSetToTrainingInput): Promise<SetToTrainingDTO> {
    const [affected] = await this.models.SetsToTrainings.update(patch as any, {
      where: { id },
    });
    if (affected === 0) {
      const err = new Error('Vínculo set↔treino não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    return row as SetToTrainingDTO;
  }

  async deleteById(id: number): Promise<boolean> {
    const affected = await this.models.SetsToTrainings.destroy({ where: { id } });
    return affected > 0;
  }
}
