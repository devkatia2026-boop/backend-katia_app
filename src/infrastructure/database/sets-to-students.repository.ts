import type { DatabaseModels } from './models';
import type {
  CreateSetToStudentInput,
  ISetsToStudentsRepository,
  ListSetsToStudentsFilters,
  PatchSetToStudentInput,
  SetToStudentByStudentListItem,
  SetToStudentDTO,
  SetToStudentStudentBrief,
} from '../../application/ports/sets-to-students.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'setstotrainings_id', 'validity', 'status', 'created_at'] as const;
const STUDENT_BRIEF = ['id', 'full_name', 'photo_perfil', 'email'] as const;
const ST_LINK = ['id', 'training_id', 'set_id', 'created_at'] as const;
const SET_NEST_ATTR = ['id', 'name', 'order', 'created_at'] as const;
const TRAINING_NEST_ATTR = ['id', 'lyric', 'description', 'created_at'] as const;

function buildWhere(filters: ListSetsToStudentsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.studentId !== undefined) where.student_id = filters.studentId;
  if (filters.setstotrainingsId !== undefined) where.setstotrainings_id = filters.setstotrainingsId;
  return where;
}

export class SequelizeSetsToStudentsRepository implements ISetsToStudentsRepository {
  constructor(
    private readonly models: Pick<
      DatabaseModels,
      'SetsToStudents' | 'Student' | 'SetsToTrainings' | 'Set' | 'Training'
    >
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
        model: this.models.SetsToTrainings,
        as: 'sets_to_training',
        attributes: [...ST_LINK],
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

  async listSetstotrainingsByStudent(
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
            model: this.models.SetsToTrainings,
            as: 'sets_to_training',
            attributes: [...ST_LINK],
            required: true,
            include: [
              {
                model: this.models.Set,
                as: 'set',
                attributes: [...SET_NEST_ATTR],
                required: false,
              },
              {
                model: this.models.Training,
                as: 'training',
                attributes: [...TRAINING_NEST_ATTR],
                required: false,
              },
            ],
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

  async listStudentsBySetstotrainings(
    setstotrainingsId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<SetToStudentStudentBrief>> {
    const offset = (page - 1) * pageSize;
    const where = { setstotrainings_id: setstotrainingsId };
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

  async studentHasLinkToSetstotrainings(
    studentId: string,
    setstotrainingsId: number
  ): Promise<boolean> {
    const n = await this.models.SetsToStudents.count({
      where: { student_id: studentId, setstotrainings_id: setstotrainingsId },
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
      const err = new Error('Vínculo aluna↔set/treino não encontrado.');
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
}
