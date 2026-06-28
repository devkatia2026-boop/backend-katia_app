import type { DatabaseModels } from './models';
import type {
  CreateProgramToStudentInput,
  IProgramsToStudentsRepository,
  ListProgramsToStudentsFilters,
  ProgramToStudentDTO,
  ProgramToStudentProgram,
  ProgramToStudentStudentBrief,
} from '../../application/ports/programs-to-students.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'program_id', 'created_at'] as const;
const STUDENT_BRIEF = ['id', 'full_name', 'photo_perfil', 'email'] as const;
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

function buildWhere(filters: ListProgramsToStudentsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.studentId !== undefined) where.student_id = filters.studentId;
  if (filters.programId !== undefined) where.program_id = filters.programId;
  return where;
}

export class SequelizeProgramsToStudentsRepository implements IProgramsToStudentsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'ProgramsToStudents' | 'Student' | 'Program'>
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
        model: this.models.Program,
        as: 'program',
        attributes: [...PROGRAM_ATTR],
        required: false,
      },
    ];
  }

  async listPaged(
    page: number,
    pageSize: number,
    filters: ListProgramsToStudentsFilters
  ): Promise<PagedList<ProgramToStudentDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildWhere(filters);
    const [total, rows] = await Promise.all([
      this.models.ProgramsToStudents.count({ where }),
      this.models.ProgramsToStudents.findAll({
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
      }) as unknown as Promise<ProgramToStudentDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async listProgramsByStudent(
    studentId: string,
    page: number,
    pageSize: number
  ): Promise<PagedList<ProgramToStudentProgram>> {
    const offset = (page - 1) * pageSize;
    const where = { student_id: studentId };
    const [total, rows] = await Promise.all([
      this.models.ProgramsToStudents.count({ where }),
      this.models.ProgramsToStudents.findAll({
        attributes: [...ATTR],
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
      }) as unknown as Promise<Array<{ program: ProgramToStudentProgram }>>,
    ]);
    return { items: rows.map((r) => r.program), total, page, pageSize };
  }

  async listStudentsByProgram(
    programId: number,
    page: number,
    pageSize: number
  ): Promise<PagedList<ProgramToStudentStudentBrief>> {
    const offset = (page - 1) * pageSize;
    const where = { program_id: programId };
    const [total, rows] = await Promise.all([
      this.models.ProgramsToStudents.count({ where }),
      this.models.ProgramsToStudents.findAll({
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
      }) as unknown as Promise<Array<{ student: ProgramToStudentStudentBrief }>>,
    ]);
    return { items: rows.map((r) => r.student), total, page, pageSize };
  }

  async create(input: CreateProgramToStudentInput): Promise<ProgramToStudentDTO> {
    const created = await this.models.ProgramsToStudents.create(input as any);
    const row = await this.models.ProgramsToStudents.findByPk(created.get('id') as number, {
      attributes: [...ATTR],
      include: this.includeOpts,
      raw: true,
      nest: true,
    });
    return row as unknown as ProgramToStudentDTO;
  }

  async deleteByProgramAndStudent(studentId: string, programId: number): Promise<boolean> {
    const n = await this.models.ProgramsToStudents.destroy({
      where: { student_id: studentId, program_id: programId },
    });
    return n > 0;
  }
}
