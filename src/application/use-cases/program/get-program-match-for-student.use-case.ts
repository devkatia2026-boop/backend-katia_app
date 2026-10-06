import { evaluateProgramAnamnesisMatch } from '../../matching/program-anamnesis-match';
import { resolveProgramMatchStudentId } from '../../matching/program-match-student-id';
import {
  loadStudentMatchProfile,
  type ProgramMatchAuth,
} from '../../matching/student-match-profile';
import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';

const NOT_FOUND = 'NotFoundException';

export type { ProgramMatchAuth };

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
    const studentId = resolveProgramMatchStudentId(rawStudentId, auth);
    const profile = await loadStudentMatchProfile(studentId, auth, this.anamnesis);
    const program = await this.programs.findById(programId);

    if (!program) {
      const err = new Error('Programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    const evaluation = evaluateProgramAnamnesisMatch(program, profile.comparable);

    return {
      student_id: studentId,
      anamnesis_id: profile.anamnesis_id,
      program_id: program.id,
      program,
      match_count: evaluation.match_count,
      total_criteria: evaluation.total_criteria,
      matches: evaluation.matches,
    };
  }
}
