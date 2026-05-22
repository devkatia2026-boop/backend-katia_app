import type { DatabaseModels } from './models';
import type {
  CreateExerciseToTrainingInput,
  ExerciseToTrainingDTO,
  ExerciseToTrainingExercise,
  ExerciseToTrainingTraining,
  IExercisesToTrainingsRepository,
  ListExercisesToTrainingsFilters,
  PatchExerciseToTrainingInput,
} from '../../application/ports/exercises-to-trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'training_id', 'exercise_id', 'created_at'] as const;
const TRAINING_ATTR = ['id', 'lyric', 'description', 'created_at'] as const;
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
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
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
        attributes: [],
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
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
        nest: true,
      }) as unknown as Promise<Array<{ exercise: ExerciseToTrainingExercise }>>,
    ]);
    return { items: rows.map((r) => r.exercise), total, page, pageSize };
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

  async create(input: CreateExerciseToTrainingInput): Promise<ExerciseToTrainingDTO> {
    const created = await this.models.ExercisesToTrainings.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as ExerciseToTrainingDTO;
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
