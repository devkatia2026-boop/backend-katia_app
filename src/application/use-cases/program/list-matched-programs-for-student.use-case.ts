import {
  evaluateProgramAnamnesisMatch,
  sortProgramsByAnamnesisMatch,
} from '../../matching/program-anamnesis-match';
import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { AnamnesisDTO, IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';
import { parseOptionalUuid } from '../../parsing/program-to-student-body.parsing';
import { parseOptionalProgramSearch } from '../../parsing/program-search.parsing';

const FORBIDDEN = 'ForbiddenException';
const NOT_FOUND = 'NotFoundException';

export type ProgramMatchAuth = {
  role: 'student' | 'trainer';
  sub: string;
};

export type MatchedProgramItem = ProgramDTO & {
  match_count: number;
  total_criteria: number;
  matches: {
    type: boolean;
    level: boolean;
    objective: boolean;
    bother: boolean;
  };
};

export type ListMatchedProgramsForStudentResult = {
  student_id: string;
  anamnesis_id: number;
  items: MatchedProgramItem[];
  total: number;
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
  const anamnesis =
    auth.role === 'trainer'
      ? await repo.findLatestForTrainerStudent(auth.sub, studentId)
      : await repo.findLatestByStudentId(studentId);

  if (!anamnesis) {
    const err = new Error('Anamnese não encontrada.');
    err.name = NOT_FOUND;
    throw err;
  }

  return anamnesis;
}

export class ListMatchedProgramsForStudentUseCase {
  constructor(
    private readonly programs: IProgramsRepository,
    private readonly anamnesis: IStudentAnamnesisRepository
  ) {}

  async execute(
    rawStudentId: unknown,
    rawSearch: unknown,
    auth: ProgramMatchAuth
  ): Promise<ListMatchedProgramsForStudentResult> {
    const studentId = resolveStudentId(rawStudentId, auth);
    const search = parseOptionalProgramSearch(rawSearch);
    const latestAnamnesis = await loadLatestAnamnesis(this.anamnesis, studentId, auth);
    const activePrograms = await this.programs.listActive(search);

    const items = sortProgramsByAnamnesisMatch(
      activePrograms.map((program) => {
        const evaluation = evaluateProgramAnamnesisMatch(program, latestAnamnesis);
        return {
          ...program,
          match_count: evaluation.match_count,
          total_criteria: evaluation.total_criteria,
          matches: evaluation.matches,
        };
      })
    );

    return {
      student_id: studentId,
      anamnesis_id: latestAnamnesis.id,
      items,
      total: items.length,
    };
  }
}
