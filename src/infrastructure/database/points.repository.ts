import { Op } from 'sequelize';
import type { DatabaseModels } from './models';
import {
  brazilDateToUtcRangeEndExclusive,
  brazilDateToUtcRangeStart,
  formatBrazilDateFromInstant,
} from '../../application/parsing/set-order-schedule.parsing';
import type {
  CreatePointInput,
  IPointsRepository,
  PointDTO,
  PointStudentBrief,
} from '../../application/ports/points.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'time', 'qtt_excercise', 'goal', 'name_training', 'created_at'] as const;
const STUDENT_LIST_ATTR = ['id', 'full_name'] as const;

function mapRowWithStudent(row: PointDTO & { student?: PointStudentBrief }): PointDTO {
  const { student, ...rest } = row;
  return {
    ...(rest as PointDTO),
    student: student ?? null,
  };
}

function toDto(raw: PointDTO & { student?: PointStudentBrief | null }): PointDTO {
  return {
    id: raw.id,
    student_id: raw.student_id,
    time: raw.time,
    qtt_excercise: raw.qtt_excercise,
    goal: raw.goal,
    name_training: raw.name_training,
    created_at: raw.created_at,
    student: raw.student ?? null,
  };
}

export class SequelizePointsRepository implements IPointsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Point' | 'Student'>
  ) {}

  async listForViewer(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId?: string
  ): Promise<PagedList<PointDTO>> {
    const offset = (page - 1) * pageSize;

    if (viewer.role === 'student') {
      const where = { student_id: viewer.sub };
      const [total, rows] = await Promise.all([
        this.models.Point.count({ where }),
        this.models.Point.findAll({
          attributes: [...ATTR],
          where,
          order: [
            ['created_at', 'DESC'],
            ['id', 'DESC'],
          ],
          limit: pageSize,
          offset,
          raw: true,
        }) as unknown as Promise<PointDTO[]>,
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

    const wherePoints = { student_id: { [Op.in]: studentIds } };

    const [total, rows] = await Promise.all([
      this.models.Point.count({ where: wherePoints }),
      this.models.Point.findAll({
        attributes: [...ATTR],
        where: wherePoints,
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
      }) as unknown as Promise<Array<PointDTO & { student: PointStudentBrief }>>,
    ]);

    return {
      items: rows.map((r) => mapRowWithStudent(r)),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<PointDTO | null> {
    const row = await this.models.Point.findByPk(id, {
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
    return toDto(row as unknown as PointDTO & { student?: PointStudentBrief });
  }

  async getStudentTrainerBrief(
    studentId: string
  ): Promise<{ trainer_id: string; full_name: string } | null> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id', 'full_name'],
      raw: true,
    });
    if (!row) return null;
    const r = row as { trainer_id: string; full_name: string };
    return { trainer_id: r.trainer_id, full_name: r.full_name };
  }

  async create(input: CreatePointInput): Promise<PointDTO> {
    const created = await this.models.Point.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as PointDTO;
  }

  async listBrazilTrainingDatesForStudent(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<string[]> {
    const rows = await this.models.Point.findAll({
      attributes: ['created_at'],
      where: {
        student_id: studentId,
        created_at: {
          [Op.gte]: brazilDateToUtcRangeStart(startDate),
          [Op.lt]: brazilDateToUtcRangeEndExclusive(endDate),
        },
      },
      raw: true,
    }) as unknown as Array<{ created_at: Date }>;

    const dates = new Set<string>();
    for (const row of rows) {
      dates.add(formatBrazilDateFromInstant(new Date(row.created_at)));
    }
    return [...dates];
  }

  async listByStudentInBrazilDateRange(
    studentId: string,
    startDate: string,
    endDate: string
  ): Promise<PointDTO[]> {
    const rows = await this.models.Point.findAll({
      attributes: [...ATTR],
      where: {
        student_id: studentId,
        created_at: {
          [Op.gte]: brazilDateToUtcRangeStart(startDate),
          [Op.lt]: brazilDateToUtcRangeEndExclusive(endDate),
        },
      },
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
    }) as unknown as PointDTO[];

    return rows.map((row) => ({ ...row, student: null }));
  }
}
