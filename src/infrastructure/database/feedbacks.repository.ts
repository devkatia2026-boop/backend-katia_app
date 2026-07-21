import type { DatabaseModels } from './models';
import type {
  CreateTrainingFeedbackInput,
  IFeedbacksRepository,
  TrainerUnrespondedFeedbacksSummary,
  TrainerUnrespondedFeedbackStudentItem,
  TrainingFeedbackDTO,
  TrainingFeedbackStudentBrief,
} from '../../application/ports/feedbacks.port';
import type { FeedbackResponseDTO } from '../../application/ports/feedback-responses.port';
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
  raw: TrainingFeedbackDTO & { student?: TrainingFeedbackStudentBrief | null; responses?: FeedbackResponseDTO[] }
): TrainingFeedbackDTO {
  return {
    id: raw.id,
    student_id: raw.student_id,
    effort: raw.effort,
    feedback: raw.feedback,
    created_at: raw.created_at,
    student: raw.student ?? null,
    responses: raw.responses ?? [],
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
        items: rows.map((r) => ({ ...r, student: null, responses: [] })),
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
      items: rows.map((r) => mapRowWithStudent({ ...r, responses: [] })),
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

  async listUnrespondedSummaryForTrainer(
    trainerId: string
  ): Promise<TrainerUnrespondedFeedbacksSummary> {
    const sequelize = this.models.Feedback.sequelize;

    if (!sequelize) {
      return { total: 0, student_ids: [], items: [] };
    }

    const [rows] = (await sequelize.query(
      `
        SELECT
          f.student_id,
          s.full_name AS student_name,
          COUNT(f.id)::int AS unresponded_count
        FROM feedbacks f
        INNER JOIN students s ON s.id = f.student_id AND s.trainer_id = :trainerId
        WHERE NOT EXISTS (
          SELECT 1 FROM responsesfeedbacks r WHERE r.feedback_id = f.id
        )
        GROUP BY f.student_id, s.full_name
        ORDER BY MAX(f.created_at) DESC, f.student_id ASC
      `,
      {
        replacements: { trainerId },
      }
    )) as [Array<{ student_id: string; student_name: string; unresponded_count: number }>, unknown];

    const items: TrainerUnrespondedFeedbackStudentItem[] = rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name?.trim() || 'Aluna',
      unresponded_count: Number(row.unresponded_count) || 0,
    }));

    const total = items.reduce((sum, item) => sum + item.unresponded_count, 0);
    const student_ids = items.map((item) => item.student_id);

    return { total, student_ids, items };
  }
}
