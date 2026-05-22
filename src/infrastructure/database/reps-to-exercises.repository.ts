import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateRepsToExerciseInput,
  IRepsToExercisesRepository,
  PatchRepsToExerciseInput,
  RepsToExerciseDTO,
  RepsToExerciseStudentBrief,
} from '../../application/ports/reps-to-exercises.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'exercise_id', 'student_id', 'reps', 'obs', 'created_at'] as const;
const STUDENT_LIST_ATTR = ['id', 'full_name'] as const;

function mapRowWithStudent(
  row: RepsToExerciseDTO & { student?: RepsToExerciseStudentBrief }
): RepsToExerciseDTO {
  const { student, ...rest } = row;
  return {
    ...(rest as RepsToExerciseDTO),
    student: student ?? null,
  };
}

function toDto(
  raw: RepsToExerciseDTO & { student?: RepsToExerciseStudentBrief | null }
): RepsToExerciseDTO {
  return {
    id: raw.id,
    exercise_id: raw.exercise_id,
    student_id: raw.student_id,
    reps: raw.reps,
    obs: raw.obs,
    created_at: raw.created_at,
    student: raw.student ?? null,
  };
}

export class SequelizeRepsToExercisesRepository implements IRepsToExercisesRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'RepsToExercises' | 'Student'>
  ) {}

  async listByExerciseForViewer(
    exerciseId: number,
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<RepsToExerciseDTO>> {
    const offset = (page - 1) * pageSize;

    if (viewer.role === 'student') {
      const where = { exercise_id: exerciseId, student_id: viewer.sub };
      const [total, rows] = await Promise.all([
        this.models.RepsToExercises.count({ where }),
        this.models.RepsToExercises.findAll({
          attributes: [...ATTR],
          where,
          order: [
            ['created_at', 'DESC'],
            ['id', 'DESC'],
          ],
          limit: pageSize,
          offset,
          raw: true,
        }) as unknown as Promise<RepsToExerciseDTO[]>,
      ]);
      return {
        items: rows.map((r) => ({ ...r, student: null })),
        total,
        page,
        pageSize,
      };
    }

    const studentWhere: Record<string, unknown> = { trainer_id: viewer.sub };
    if (filterStudentId !== undefined) {
      studentWhere.id = filterStudentId;
    }

    const studentRows = await this.models.Student.findAll({
      attributes: ['id'],
      where: studentWhere,
      raw: true,
    });
    const studentIds = (studentRows as { id: string }[]).map((r) => r.id);
    if (studentIds.length === 0) {
      return { items: [], total: 0, page, pageSize };
    }

    const whereReps = {
      exercise_id: exerciseId,
      student_id: { [Op.in]: studentIds },
    };

    const [total, rows] = await Promise.all([
      this.models.RepsToExercises.count({ where: whereReps }),
      this.models.RepsToExercises.findAll({
        attributes: [...ATTR],
        where: whereReps,
        include: [
          {
            model: this.models.Student,
            as: 'student',
            attributes: [...STUDENT_LIST_ATTR],
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
      }) as unknown as Promise<Array<RepsToExerciseDTO & { student: RepsToExerciseStudentBrief }>>,
    ]);

    return {
      items: rows.map((r) => mapRowWithStudent(r)),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<RepsToExerciseDTO | null> {
    const row = await this.models.RepsToExercises.findByPk(id, {
      attributes: [...ATTR],
      include: [
        {
          model: this.models.Student,
          as: 'student',
          attributes: [...STUDENT_LIST_ATTR],
          required: false,
        },
      ],
      raw: true,
      nest: true,
    });
    if (!row) return null;
    return toDto(row as unknown as RepsToExerciseDTO & { student?: RepsToExerciseStudentBrief });
  }

  async getTrainerIdForRowStudent(studentId: string): Promise<string | null> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id'],
      raw: true,
    });
    return row ? (row as { trainer_id: string }).trainer_id : null;
  }

  async create(input: CreateRepsToExerciseInput): Promise<RepsToExerciseDTO> {
    const created = await this.models.RepsToExercises.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as RepsToExerciseDTO;
  }

  async update(id: number, patch: PatchRepsToExerciseInput): Promise<RepsToExerciseDTO> {
    const [affected] = await this.models.RepsToExercises.update(patch as any, { where: { id } });
    if (affected === 0) {
      const err = new Error('Orientação (reps/exercise) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    if (!row) {
      const err = new Error('Orientação (reps/exercise) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    return row;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.RepsToExercises.destroy({ where: { id } });
    return n > 0;
  }
}
