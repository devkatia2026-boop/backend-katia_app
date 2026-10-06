import { parseIntroductionCreateBody } from '../../parsing/introduction-body.parsing';
import type { IIntroductionsRepository, IntroductionDTO } from '../../ports/introductions.port';
import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class CreateIntroductionUseCase {
  constructor(
    private readonly introductions: IIntroductionsRepository,
    private readonly programs: IProgramsRepository
  ) {}

  async execute(body: unknown): Promise<IntroductionDTO> {
    const input = parseIntroductionCreateBody(body);
    const program = await this.programs.findById(input.program_id);
    if (!program) {
      const err = new Error('Programa não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.introductions.create(input);
  }
}
