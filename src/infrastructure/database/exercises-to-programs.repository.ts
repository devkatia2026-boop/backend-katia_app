import type { DatabaseModels } from './models';
import type {
  CreateExerciseToProgramInput,
  ExerciseToProgramDTO,
  ExerciseToProgramExercise,
  ExerciseToProgramProgram,
  IExercisesToProgramsRepository,
  ListExercisesToProgramsFilters,
  PatchExerciseToProgramInput,
} from '../../application/ports/exercises-to-programs.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'program_id', 'exercise_id', 'created_at'] as const;
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
const EXERCISE_ATTR = [
  'id',
  'name',
  'video',
  'type',
  'description',
  'level',
  'created_at',
] as const;

function buildWhere(filters: ListExercisesToProgramsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.programId !== undefined) where.program_id = filters.programId;
  if (filters.exerciseId !== undefined) where.exercise_id = filters.exerciseId;
  return where;
}

export class SequelizeExercisesToProgramsRepository implements IExercisesToProgramsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'ExercisesToPrograms' | 'Program' | 'Exercise'>
  ) {}

  private get includeOpts() {
    return [
      { model: this.models.Program, as: 'program', attributes: [...PROGRAM_ATTR], required: false },
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
    filters: ListExercisesToProgramsFilters
  ): Promise<PagedList<ExerciseToProgramDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.ExercisesToPrograms.count({ where }),
      this.models.ExercisesToPrograms.findAll({
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
      }) as unknown as Promise<ExerciseToProgramDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listExercisesByProgram(
    programId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToProgramExercise>> {
    const offset = (page - 1) * pageSize;
    const where = { program_id: programId };
    const [total, rows] = await Promise.all([
      this.models.ExercisesToPrograms.count({ where }),
      this.models.ExercisesToPrograms.findAll({
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
      }) as unknown as Promise<Array<{ exercise: ExerciseToProgramExercise }>>,
    ]);
    return { items: rows.map((r) => r.exercise), total, page, pageSize };
  }

  async listProgramsByExercise(
    exerciseId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ExerciseToProgramProgram>> {
    const offset = (page - 1) * pageSize;
    const where = { exercise_id: exerciseId };
    const [total, rows] = await Promise.all([
      this.models.ExercisesToPrograms.count({ where }),
      this.models.ExercisesToPrograms.findAll({
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
      }) as unknown as Promise<Array<{ program: ExerciseToProgramProgram }>>,
    ]);
    return { items: rows.map((r) => r.program), total, page, pageSize };
  }

  findById(id: number): Promise<ExerciseToProgramDTO | null> {
    return this.models.ExercisesToPrograms.findByPk(id, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    }) as unknown as Promise<ExerciseToProgramDTO | null>;
  }

  async create(input: CreateExerciseToProgramInput): Promise<ExerciseToProgramDTO> {
    const created = await this.models.ExercisesToPrograms.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as ExerciseToProgramDTO;
  }

  async update(id: number, patch: PatchExerciseToProgramInput): Promise<ExerciseToProgramDTO> {
    const [affected] = await this.models.ExercisesToPrograms.update(patch as any, {
      where: { id },
    });
    if (affected === 0) {
      const err = new Error('Vínculo exercício↔programa não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    return row as ExerciseToProgramDTO;
  }

  async deleteById(id: number): Promise<boolean> {
    const affected = await this.models.ExercisesToPrograms.destroy({ where: { id } });
    return affected > 0;
  }
}
