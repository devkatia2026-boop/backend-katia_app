import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { IIntroductionsRepository, IntroductionDTO } from '../../ports/introductions.port';
import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class GetIntroductionUseCase {
  constructor(
    private readonly introductions: IIntroductionsRepository,
    private readonly programs: IProgramsRepository
  ) {}

  async execute(introductionId: number, role: ContentViewerRole): Promise<IntroductionDTO> {
    const row = await this.introductions.findById(introductionId);
    if (!row) {
      const err = new Error('Introdução não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      const program = await this.programs.findById(row.program_id);
      if (!program) {
        const err = new Error('Introdução não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(program.status, 'Introdução não encontrada.');
    }
    return row;
  }
}
