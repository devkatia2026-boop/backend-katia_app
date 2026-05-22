import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import type {
  CreateObsToTrainingInput,
  IObsToTrainingsRepository,
  ObsToTrainingDTO,
  ObsToTrainingStudentBrief,
  PatchObsToTrainingInput,
} from '../../application/ports/obs-to-trainings.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'training_id', 'student_id', 'obs', 'created_at'] as const;
const STUDENT_LIST_ATTR = ['id', 'full_name'] as const;

function mapRowWithStudent(
  row: ObsToTrainingDTO & { student?: ObsToTrainingStudentBrief }
): ObsToTrainingDTO {
  const { student, ...rest } = row;
  return {
    ...(rest as ObsToTrainingDTO),
    student: student ?? null,
  };
}

function toDto(
  raw: ObsToTrainingDTO & { student?: ObsToTrainingStudentBrief | null }
): ObsToTrainingDTO {
  return {
    id: raw.id,
    training_id: raw.training_id,
    student_id: raw.student_id,
    obs: raw.obs,
    created_at: raw.created_at,
    student: raw.student ?? null,
  };
}

export class SequelizeObsToTrainingsRepository implements IObsToTrainingsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'ObsToTrainings' | 'Student'>
  ) {}

  async listByTrainingForViewer(
    trainingId: number,
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<ObsToTrainingDTO>> {
    const offset = (page - 1) * pageSize;

    if (viewer.role === 'student') {
      const where = { training_id: trainingId, student_id: viewer.sub };
      const [total, rows] = await Promise.all([
        this.models.ObsToTrainings.count({ where }),
        this.models.ObsToTrainings.findAll({
          attributes: [...ATTR],
          where,
          order: [
            ['created_at', 'DESC'],
            ['id', 'DESC'],
          ],
          limit: pageSize,
          offset,
          raw: true,
        }) as unknown as Promise<ObsToTrainingDTO[]>,
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

    const whereObs = {
      training_id: trainingId,
      student_id: { [Op.in]: studentIds },
    };

    const [total, rows] = await Promise.all([
      this.models.ObsToTrainings.count({ where: whereObs }),
      this.models.ObsToTrainings.findAll({
        attributes: [...ATTR],
        where: whereObs,
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
      }) as unknown as Promise<Array<ObsToTrainingDTO & { student: ObsToTrainingStudentBrief }>>,
    ]);

    return {
      items: rows.map((r) => mapRowWithStudent(r)),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<ObsToTrainingDTO | null> {
    const row = await this.models.ObsToTrainings.findByPk(id, {
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
    return toDto(row as unknown as ObsToTrainingDTO & { student?: ObsToTrainingStudentBrief });
  }

  async getTrainerIdForRowStudent(studentId: string): Promise<string | null> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id'],
      raw: true,
    });
    return row ? (row as { trainer_id: string }).trainer_id : null;
  }

  async create(input: CreateObsToTrainingInput): Promise<ObsToTrainingDTO> {
    const created = await this.models.ObsToTrainings.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as ObsToTrainingDTO;
  }

  async update(id: number, patch: PatchObsToTrainingInput): Promise<ObsToTrainingDTO> {
    const [affected] = await this.models.ObsToTrainings.update(patch as any, { where: { id } });
    if (affected === 0) {
      const err = new Error('Observação (training) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    if (!row) {
      const err = new Error('Observação (training) não encontrada.');
      err.name = 'NotFoundException';
      throw err;
    }
    return row;
  }

  async deleteById(id: number): Promise<boolean> {
    const n = await this.models.ObsToTrainings.destroy({ where: { id } });
    return n > 0;
  }
}
