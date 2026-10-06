import { parseIntroductionPatchBody } from '../../parsing/introduction-body.parsing';
import type { IIntroductionsRepository, IntroductionDTO } from '../../ports/introductions.port';
import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateIntroductionUseCase {
  constructor(
    private readonly introductions: IIntroductionsRepository,
    private readonly programs: IProgramsRepository
  ) {}

  async execute(introductionId: number, body: unknown): Promise<IntroductionDTO> {
    const patch = parseIntroductionPatchBody(body);
    if (patch.program_id !== undefined) {
      const program = await this.programs.findById(patch.program_id);
      if (!program) {
        const err = new Error('Programa não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }
    return this.introductions.update(introductionId, patch);
  }
}
