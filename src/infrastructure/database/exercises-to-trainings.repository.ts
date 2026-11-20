import type { DatabaseModels } from './models';
import type {
  CreateExerciseToTrainingInput,
  ExerciseToTrainingDTO,
  ExerciseToTrainingExercise,
  ExerciseToTrainingTraining,
  IExercisesToTrainingsRepository,
  ExerciseToTrainingReorderDirection,
  ListExercisesToTrainingsFilters,
  PatchExerciseToTrainingInput,
} from '../../application/ports/exercises-to-trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'training_id', 'exercise_id', 'sort_order', 'created_at'] as const;
const TRAINING_ATTR = ['id', 'lyric', 'description', 'time', 'type', 'muscles', 'created_at'] as const;
const EXERCISE_ATTR = [
  'id',
  'name',
  'video',
  'type',
  'description',
  'level',
  'created_at',
] as const;

function buildWhere(filters: ListExercisesToTrainingsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.trainingId !== undefined) where.training_id = filters.trainingId;
  if (filters.exerciseId !== undefined) where.exercise_id = filters.exerciseId;
  return where;
}

function buildListOrder(filters: ListExercisesToTrainingsFilters): [string, string][] {
  if (filters.trainingId !== undefined) {
    return [
      ['sort_order', 'ASC'],
      ['id', 'ASC'],
    ];
  }

  return [
    ['created_at', 'DESC'],
    ['id', 'DESC'],
  ];
}

export class SequelizeExercisesToTrainingsRepository implements IExercisesToTrainingsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'ExercisesToTrainings' | 'Training' | 'Exercise'>
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
        model: this.models.Exercise,
        as: 'exercise',
        attributes: [...EXERCISE_ATTR],
        required: false,
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters: ListExercisesToTrainingsFilters
  ): Promise<PagedList<ExerciseToTrainingDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.ExercisesToTrainings.count({ where }),
      this.models.ExercisesToTrainings.findAll({
        attributes: [...ATTR],
        where,
        include: this.includeOpts,
        order: buildListOrder(filters),
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<ExerciseToTrainingDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listExercisesByTraining(
    trainingId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToTrainingExercise>> {
    const offset = (page - 1) * pageSize;
    const where = { training_id: trainingId };
    const [total, rows] = await Promise.all([
      this.models.ExercisesToTrainings.count({ where }),
      this.models.ExercisesToTrainings.findAll({
        attributes: ['id', 'sort_order'],
        where,
        include: [
          {
            model: this.models.Exercise,
            as: 'exercise',
            attributes: [...EXERCISE_ATTR],
            required: true,
          },
        ],
        order: [
          ['sort_order', 'ASC'],
          ['id', 'ASC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<
        Array<{ id: number; sort_order: number; exercise: ExerciseToTrainingExercise }>
      >,
    ]);
    return {
      items: rows.map((r) => ({
        ...r.exercise,
        link_id: r.id,
        sort_order: r.sort_order,
      })),
      total,
      page,
      pageSize,
    };
  }

  async listTrainingsByExercise(
    exerciseId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToTrainingTraining>> {
    const offset = (page - 1) * pageSize;
    const where = { exercise_id: exerciseId };
    const [total, rows] = await Promise.all([
      this.models.ExercisesToTrainings.count({ where }),
      this.models.ExercisesToTrainings.findAll({
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
      }) as unknown as Promise<Array<{ training: ExerciseToTrainingTraining }>>,
    ]);
    return { items: rows.map((r) => r.training), total, page, pageSize };
  }

  findById(id: number): Promise<ExerciseToTrainingDTO | null> {
    return this.models.ExercisesToTrainings.findByPk(id, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    }) as unknown as Promise<ExerciseToTrainingDTO | null>;
  }

  async resolveNextSortOrderForTraining(trainingId: number): Promise<number> {
    const max = (await this.models.ExercisesToTrainings.max('sort_order', {
      where: { training_id: trainingId },
    })) as number | null;
    if (max === null || max === undefined || !Number.isFinite(Number(max))) {
      return 0;
    }
    return Number(max) + 1;
  }

  async create(input: CreateExerciseToTrainingInput): Promise<ExerciseToTrainingDTO> {
    const sortOrder = await this.resolveNextSortOrderForTraining(input.training_id);
    const created = await this.models.ExercisesToTrainings.create({
      ...input,
      sort_order: sortOrder,
    } as any);
    const row = await this.findById(created.get('id') as number);
    return row as ExerciseToTrainingDTO;
  }

  async applySortOrderForTraining(
    trainingId: number,
    orderedLinkIds: readonly number[]
  ): Promise<void> {
    const sequelize = this.models.ExercisesToTrainings.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize indisponível.');
    }

    await sequelize.transaction(async (transaction) => {
      for (let index = 0; index < orderedLinkIds.length; index += 1) {
        await this.models.ExercisesToTrainings.update(
          { sort_order: index },
          {
            where: { id: orderedLinkIds[index], training_id: trainingId },
            transaction,
          }
        );
      }
    });
  }

  async reorderByDirection(
    linkId: number,
    direction: ExerciseToTrainingReorderDirection
  ): Promise<void> {
    const current = await this.findById(linkId);
    if (!current) {
      const err = new Error('Vínculo exercício↔treino não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }

    const sequelize = this.models.ExercisesToTrainings.sequelize;
    if (!sequelize) {
      throw new Error('Sequelize indisponível.');
    }

    await sequelize.transaction(async (transaction) => {
      const rows = (await this.models.ExercisesToTrainings.findAll({
        attributes: ['id', 'sort_order'],
        where: { training_id: current.training_id },
        order: [
          ['sort_order', 'ASC'],
          ['id', 'ASC'],
        ],
        transaction,
        raw: true,
      })) as Array<{ id: number; sort_order: number }>;

      const index = rows.findIndex((row) => row.id === linkId);
      if (index < 0) {
        return;
      }

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= rows.length) {
        return;
      }

      const currentRow = rows[index];
      const neighbor = rows[targetIndex];
      const currentOrder = currentRow.sort_order;
      const neighborOrder = neighbor.sort_order;

      await this.models.ExercisesToTrainings.update(
        { sort_order: neighborOrder },
        { where: { id: currentRow.id }, transaction }
      );
      await this.models.ExercisesToTrainings.update(
        { sort_order: currentOrder },
        { where: { id: neighbor.id }, transaction }
      );
    });
  }

  async update(id: number, patch: PatchExerciseToTrainingInput): Promise<ExerciseToTrainingDTO> {
    const [affected] = await this.models.ExercisesToTrainings.update(patch as any, {
      where: { id },
    });
    if (affected === 0) {
      const err = new Error('Vínculo exercício↔treino não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    return row as ExerciseToTrainingDTO;
  }

  async deleteById(id: number): Promise<boolean> {
    const affected = await this.models.ExercisesToTrainings.destroy({ where: { id } });
    return affected > 0;
  }
}
