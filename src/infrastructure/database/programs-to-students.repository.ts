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
import { buildProgramSearchWhere, mergeProgramWhere } from './program-search';

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
  'objective',
  'bother',
  'created_at',
] as const;

function buildLinkWhere(filters: ListProgramsToStudentsFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {};
  if (filters.studentId !== undefined) where.student_id = filters.studentId;
  if (filters.programId !== undefined) where.program_id = filters.programId;
  return where;
}

export class SequelizeProgramsToStudentsRepository implements IProgramsToStudentsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'ProgramsToStudents' | 'Student' | 'Program'>
  ) {}

  private programInclude(search: string | undefined, required: boolean) {
    const searchWhere = buildProgramSearchWhere(search);
    return {
      model: this.models.Program,
      as: 'program' as const,
      attributes: [...PROGRAM_ATTR],
      required: required || searchWhere !== undefined,
      ...(searchWhere ? { where: searchWhere } : {}),
    };
  }

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
    const where = buildLinkWhere(filters);
    const include = [
      {
        model: this.models.Student,
        as: 'student',
        attributes: [...STUDENT_BRIEF],
        required: false,
      },
      this.programInclude(filters.search, filters.search !== undefined),
    ];

    const [total, rows] = await Promise.all([
      this.models.ProgramsToStudents.count({
        where,
        include,
        distinct: true,
        col: 'id',
      }),
      this.models.ProgramsToStudents.findAll({
        attributes: [...ATTR],
        where,
        include,
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
    pageSize: number,
    search?: string
  ): Promise<PagedList<ProgramToStudentProgram>> {
    const offset = (page - 1) * pageSize;
    const where = { student_id: studentId };
    const include = [this.programInclude(search, true)];

    const [total, rows] = await Promise.all([
      this.models.ProgramsToStudents.count({
        where,
        include,
        distinct: true,
        col: 'id',
      }),
      this.models.ProgramsToStudents.findAll({
        attributes: [...ATTR],
        where,
        include,
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
    pageSize: number,
    search?: string
  ): Promise<PagedList<ProgramToStudentStudentBrief>> {
    if (search !== undefined) {
      const program = await this.models.Program.findOne({
        attributes: ['id'],
        where: mergeProgramWhere({ id: programId }, search),
        raw: true,
      });
      if (!program) {
        return { items: [], total: 0, page, pageSize };
      }
    }

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
