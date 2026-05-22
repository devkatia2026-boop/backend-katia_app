import type { ProgramDTO } from '../../ports/programs.port';
import type { IProgramsRepository } from '../../ports/programs.port';
import { parseProgramCreateBody } from '../../parsing/program-body.parsing';

export class CreateProgramUseCase {
  constructor(private readonly programs: IProgramsRepository) {}

  execute(body: unknown): Promise<ProgramDTO> {
    const input = parseProgramCreateBody(body);
    return this.programs.create(input);
  }
}
