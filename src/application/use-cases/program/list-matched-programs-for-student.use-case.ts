import {
  evaluateProgramAnamnesisMatch,
  sortProgramsByAnamnesisMatch,
} from '../../matching/program-anamnesis-match';
import { resolveProgramMatchStudentId } from '../../matching/program-match-student-id';
import {
  loadStudentMatchProfile,
  type ProgramMatchAuth,
} from '../../matching/student-match-profile';
import type { IProgramsRepository, ProgramDTO } from '../../ports/programs.port';
import type { IStudentAnamnesisRepository } from '../../ports/student-anamnesis.port';
import { parseOptionalProgramSearch } from '../../parsing/program-search.parsing';

export type { ProgramMatchAuth };

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
    const studentId = resolveProgramMatchStudentId(rawStudentId, auth);
    const search = parseOptionalProgramSearch(rawSearch);
    const profile = await loadStudentMatchProfile(studentId, auth, this.anamnesis);
    const activePrograms = await this.programs.listActive(search);

    const items = sortProgramsByAnamnesisMatch(
      activePrograms.map((program) => {
        const evaluation = evaluateProgramAnamnesisMatch(program, profile.comparable);
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
      anamnesis_id: profile.anamnesis_id,
      items,
      total: items.length,
    };
  }
}
