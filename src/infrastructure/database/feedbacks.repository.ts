import type { DatabaseModels } from './models';
import type {
  CreateTrainingFeedbackInput,
  IFeedbacksRepository,
  TrainingFeedbackDTO,
  TrainingFeedbackStudentBrief,
} from '../../application/ports/feedbacks.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'effort', 'feedback', 'created_at'] as const;
const STUDENT_LIST_ATTR = ['id', 'full_name'] as const;

function mapRowWithStudent(
  row: TrainingFeedbackDTO & { student?: TrainingFeedbackStudentBrief }
): TrainingFeedbackDTO {
  const { student, ...rest } = row;
  return {
    ...(rest as TrainingFeedbackDTO),
    student: student ?? null,
  };
}

function toDto(
  raw: TrainingFeedbackDTO & { student?: TrainingFeedbackStudentBrief | null }
): TrainingFeedbackDTO {
  return {
    id: raw.id,
    student_id: raw.student_id,
    effort: raw.effort,
    feedback: raw.feedback,
    created_at: raw.created_at,
    student: raw.student ?? null,
  };
}

export class SequelizeFeedbacksRepository implements IFeedbacksRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Feedback' | 'Student'>
  ) {}

  async listForViewer(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId: string | undefined
  ): Promise<PagedList<TrainingFeedbackDTO>> {
    const offset = (page - 1) * pageSize;

    if (viewer.role === 'student') {
      const where = { student_id: viewer.sub };
      const [total, rows] = await Promise.all([
        this.models.Feedback.count({ where }),
        this.models.Feedback.findAll({
          attributes: [...ATTR],
          where,
          order: [
            ['created_at', 'DESC'],
            ['id', 'DESC'],
          ],
          limit: pageSize,
          offset,
          raw: true,
        }) as unknown as Promise<TrainingFeedbackDTO[]>,
      ]);
      return {
        items: rows.map((r) => ({ ...r, student: null })),
        total,
        page,
        pageSize,
      };
    }

    const sid = filterStudentId!;

    const studentRow = await this.models.Student.findOne({
      attributes: ['id'],
      where: { id: sid, trainer_id: viewer.sub },
      raw: true,
    });
    if (!studentRow) {
      return { items: [], total: 0, page, pageSize };
    }

    const whereFb = { student_id: sid };

    const [total, rows] = await Promise.all([
      this.models.Feedback.count({ where: whereFb }),
      this.models.Feedback.findAll({
        attributes: [...ATTR],
        where: whereFb,
        include: [
          {
            model: this.models.Student,
            as: 'student',
            attributes: [...STUDENT_LIST_ATTR],
            required: true,
            where: { trainer_id: viewer.sub },
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
      }) as unknown as Promise<Array<TrainingFeedbackDTO & { student: TrainingFeedbackStudentBrief }>>,
    ]);

    return {
      items: rows.map((r) => mapRowWithStudent(r)),
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number): Promise<TrainingFeedbackDTO | null> {
    const row = await this.models.Feedback.findByPk(id, {
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
    return toDto(row as unknown as TrainingFeedbackDTO & { student?: TrainingFeedbackStudentBrief });
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

  async create(input: CreateTrainingFeedbackInput): Promise<TrainingFeedbackDTO> {
    const created = await this.models.Feedback.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as TrainingFeedbackDTO;
  }
}
