import type { DatabaseModels } from './models';
import type {
  CreateSetToStudentInput,
  ISetsToStudentsRepository,
  ListSetsToStudentsFilters,
  PatchSetToStudentInput,
  SetToStudentByStudentListItem,
  SetToStudentDTO,
  SetToStudentStudentBrief,
  SetValidityReminderLink,
  TrainerPastValidityStudentsSummary,
  TrainerPastValidityStudentItem,
} from '../../application/ports/sets-to-students.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'sets_id', 'validity', 'status', 'created_at'] as const;
const STUDENT_BRIEF = ['id', 'full_name', 'photo_perfil', 'email'] as const;
const SET_NEST_ATTR = ['id', 'name', 'order', 'cardio', 'stretching', 'created_at'] as const;

function buildWhere(filters: ListSetsToStudentsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.studentId !== undefined) where.student_id = filters.studentId;
  if (filters.setsId !== undefined) where.sets_id = filters.setsId;
  return where;
}

export class SequelizeSetsToStudentsRepository implements ISetsToStudentsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'SetsToStudents' | 'Student' | 'Set' | 'Trainer'>
  ) {}

  private get includeOpts() {
    return [
      {
        model: this.models.Student,
        as: 'student',
        attributes: [...STUDENT_BRIEF],
        required: false,
      },
      {
        model: this.models.Set,
        as: 'set',
        attributes: [...SET_NEST_ATTR],
        required: false,
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters: ListSetsToStudentsFilters
  ): Promise<PagedList<SetToStudentDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.SetsToStudents.count({ where }),
      this.models.SetsToStudents.findAll({
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
      }) as unknown as Promise<SetToStudentDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listSetsByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentByStudentListItem>> {
    const offset = (page - 1) * pageSize;
    const where = { student_id: studentId };
    const [total, rows] = await Promise.all([
      this.models.SetsToStudents.count({ where }),
      this.models.SetsToStudents.findAll({
        attributes: [...ATTR],
        where,
        include: [
          {
            model: this.models.Set,
            as: 'set',
            attributes: [...SET_NEST_ATTR],
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
      }) as unknown as Promise<SetToStudentByStudentListItem[]>,
    ]);
    return {
      items: rows,
      total,
      page,
      pageSize,
    };
  }

  async listActiveSetsByStudent(studentId: string): Promise<SetToStudentByStudentListItem[]> {
    return this.models.SetsToStudents.findAll({
      attributes: [...ATTR],
      where: {
        student_id: studentId,
        status: true,
      },
      include: [
        {
          model: this.models.Set,
          as: 'set',
          attributes: [...SET_NEST_ATTR],
          required: true,
        },
      ],
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
      raw: true,
      nest: true,
    }) as unknown as Promise<SetToStudentByStudentListItem[]>;
  }

  async listStudentsBySet(
    setsId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentStudentBrief>> {
    const offset = (page - 1) * pageSize;
    const where = { sets_id: setsId };
    const [total, rows] = await Promise.all([
      this.models.SetsToStudents.count({ where }),
      this.models.SetsToStudents.findAll({
        attributes: [],
        where,
        include: [
          {
            model: this.models.Student,
            as: 'student',
            attributes: [...STUDENT_BRIEF],
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
      }) as unknown as Promise<Array<{ student: SetToStudentStudentBrief }>>,
    ]);
    return { items: rows.map((r) => r.student), total, page, pageSize };
  }

  findById(id: number): Promise<SetToStudentDTO | null> {
    return this.models.SetsToStudents.findByPk(id, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    }) as unknown as Promise<SetToStudentDTO | null>;
  }

  async getStudentIdForLink(id: number): Promise<string | null> {
    const row = await this.models.SetsToStudents.findByPk(id, {
      attributes: ['student_id'],
      raw: true,
    });
    return row ? (row as { student_id: string }).student_id : null;
  }

  async studentHasLinkToSet(studentId: string, setsId: number): Promise<boolean> {
    const n = await this.models.SetsToStudents.count({
      where: { student_id: studentId, sets_id: setsId },
    });
    return n > 0;
  }

  async studentBelongsToTrainer(studentId: string, trainerId: string): Promise<boolean> {
    const row = await this.models.Student.findByPk(studentId, {
      attributes: ['trainer_id'],
      raw: true,
    });
    if (!row) return false;
    return (row as { trainer_id: string }).trainer_id === trainerId;
  }

  async create(input: CreateSetToStudentInput): Promise<SetToStudentDTO> {
    const created = await this.models.SetsToStudents.create(input as any);
    const row = await this.findById(created.get('id') as number);
    return row as SetToStudentDTO;
  }

  async update(id: number, patch: PatchSetToStudentInput): Promise<SetToStudentDTO> {
    const [affected] = await this.models.SetsToStudents.update(patch as any, {
      where: { id },
    });
    if (affected === 0) {
      const err = new Error('Vínculo aluna↔set não encontrado.');
      err.name = 'NotFoundException';
      throw err;
    }
    const row = await this.findById(id);
    return row as SetToStudentDTO;
  }

  async deleteById(id: number): Promise<boolean> {
    const affected = await this.models.SetsToStudents.destroy({ where: { id } });
    return affected > 0;
  }

  async listPastValidityStudentsForTrainer(
    trainerId: string,
    todayIso: string
  ): Promise<TrainerPastValidityStudentsSummary> {
    const sequelize = this.models.SetsToStudents.sequelize;

    if (!sequelize) {
      return { total: 0, student_ids: [], items: [] };
    }

    const [rows] = (await sequelize.query(
      `
        SELECT
          sts.student_id,
          s.full_name AS student_name,
          COUNT(sts.id)::int AS expired_sets_count
        FROM setstostudents sts
        INNER JOIN students s ON s.id = sts.student_id AND s.trainer_id = :trainerId
        WHERE sts.status = true
          AND sts.validity IS NOT NULL
          AND sts.validity < :todayIso
        GROUP BY sts.student_id, s.full_name
        ORDER BY MIN(sts.validity) ASC, sts.student_id ASC
      `,
      {
        replacements: { trainerId, todayIso },
      }
    )) as [Array<{ student_id: string; student_name: string; expired_sets_count: number }>, unknown];

    const items: TrainerPastValidityStudentItem[] = rows.map((row) => ({
      student_id: row.student_id,
      student_name: row.student_name?.trim() || 'Aluna',
      expired_sets_count: Number(row.expired_sets_count) || 0,
    }));

    const total = items.reduce((sum, item) => sum + item.expired_sets_count, 0);
    const student_ids = items.map((item) => item.student_id);

    return { total, student_ids, items };
  }

  async listActiveSetsWithValidityForReminders(): Promise<SetValidityReminderLink[]> {
    const sequelize = this.models.SetsToStudents.sequelize;

    if (!sequelize) {
      return [];
    }

    const [rows] = (await sequelize.query(
      `
        SELECT
          sts.id,
          sts.student_id,
          sts.sets_id,
          sts.validity,
          s.full_name AS student_name,
          s.trainer_id,
          t.expo_push_token AS trainer_expo_push_token,
          sets.name AS set_name
        FROM setstostudents sts
        INNER JOIN students s ON s.id = sts.student_id
        INNER JOIN trainers t ON t.id = s.trainer_id
        LEFT JOIN sets ON sets.id = sts.sets_id
        WHERE sts.status = true
          AND sts.validity IS NOT NULL
        ORDER BY sts.validity ASC, sts.id ASC
      `
    )) as [
      Array<{
        id: number;
        student_id: string;
        sets_id: number;
        validity: string;
        student_name: string;
        trainer_id: string;
        trainer_expo_push_token: string | null;
        set_name: string | null;
      }>,
      unknown,
    ];

    return rows.map((row) => ({
      id: Number(row.id),
      student_id: row.student_id,
      student_name: row.student_name?.trim() || 'Aluna',
      trainer_id: row.trainer_id,
      sets_id: Number(row.sets_id),
      set_name: row.set_name?.trim() || null,
      validity: row.validity,
      trainer_expo_push_token: row.trainer_expo_push_token?.trim() || null,
    }));
  }
}
