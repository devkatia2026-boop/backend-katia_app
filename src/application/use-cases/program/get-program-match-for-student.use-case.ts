import { evaluateProgramAnamnesisMatch } from '../../matching/program-anamnesis-match';
import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';
import { parseOptionalUuid } from '../../parsing/program-to-student-body.parsing';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'NotFoundException';

export type ProgramMatchAuth = {
  role: 'student' | 'trainer';
  sub: string;
};

export type GetProgramMatchForStudentResult = {
  student_id: string;
  anamnesis_id: number;
  program_id: number;
  program: ProgramDTO;
  match_count: number;
  total_criteria: number;
  matches: {
    type: boolean;
    level: boolean;
    objective: boolean;
    bother: boolean;
  };
};

function sameStudentId(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function resolveStudentId(rawStudentId: unknown, auth: ProgramMatchAuth): string {
  if (auth.role === 'student') {
    const studentId = parseOptionalUuid(rawStudentId, 'studentId');
    if (studentId !== undefined && !sameStudentId(studentId, auth.sub)) {
      const err = new Error('Você só pode consultar programas para a própria aluna.');
      err.name = FORBIDDEN;
      throw err;
    }
    return auth.sub;
  }

  const studentId = parseOptionalUuid(rawStudentId, 'studentId');
  if (studentId === undefined) {
    const err = new Error('Informe studentId.');
    err.name = FORBIDDEN;
    throw err;
  }
  return studentId;
}

async function loadLatestAnamnesis(
  repo: IStudentAnamnesisRepository,
  studentId: string,
  auth: ProgramMatchAuth
): Promise<AnamnesisDTO> {
  const row =
    auth.role === 'trainer'
      ? await repo.findLatestForTrainerStudent(auth.sub, studentId)
      : await repo.findLatestByStudentId(studentId);

  if (!row) {
    const err = new Error('Anamnese não encontrada.');
    err.name = NOT_FOUND;
    throw err;
  }

  return row;
}

export class GetProgramMatchForStudentUseCase {
  constructor(
    private readonly programs: IProgramsRepository,
    private readonly anamnesis: IStudentAnamnesisRepository
  ) {}

  async execute(
    programId: number,
    rawStudentId: unknown,
    auth: ProgramMatchAuth
  ): Promise<GetProgramMatchForStudentResult> {
    const studentId = resolveStudentId(rawStudentId, auth);
    const latestAnamnesis = await loadLatestAnamnesis(this.anamnesis, studentId, auth);
    const program = await this.programs.findById(programId);

    if (!program) {
      const err = new Error('Programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    const evaluation = evaluateProgramAnamnesisMatch(program, latestAnamnesis);

    return {
      student_id: studentId,
      anamnesis_id: latestAnamnesis.id,
      program_id: program.id,
      program,
      match_count: evaluation.match_count,
      total_criteria: evaluation.total_criteria,
      matches: evaluation.matches,
    };
  }
}
