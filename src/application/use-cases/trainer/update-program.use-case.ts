import type { ProgramDTO } from '../../ports/programs.port';
import type { IProgramsRepository } from '../../ports/programs.port';
import { parseProgramPatchBody } from '../../parsing/program-body.parsing';

export class UpdateProgramUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  execute(programId: number, body: unknown): Promise<ProgramDTO> {
    const patch = parseProgramPatchBody(body);
    return this.programs.update(programId, patch);
  }
}
