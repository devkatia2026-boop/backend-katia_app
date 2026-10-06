import { assertActiveForStudent } from '../../parsing/content-viewer.parsing';
import type { ContentViewerRole } from '../../parsing/content-viewer.parsing';
import type { ContentDTO, IContentsRepository } from '../../ports/contents.port';
import type { IIntroductionsRepository } from '../../ports/introductions.port';
import type { IProgramsRepository } from '../../ports/programs.port';

const NOT_FOUND = 'NotFoundException';

export class GetContentUseCase {
  constructor(
    private readonly contents: IContentsRepository,
    private readonly introductions: IIntroductionsRepository,
    private readonly programs: IProgramsRepository
  ) {}

  async execute(contentId: number, role: ContentViewerRole): Promise<ContentDTO> {
    const row = await this.contents.findById(contentId);
    if (!row) {
      const err = new Error('Conteúdo não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    if (role === 'student') {
      const intro = await this.introductions.findById(row.introduction_id);
      if (!intro) {
        const err = new Error('Conteúdo não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      const program = await this.programs.findById(intro.program_id);
      if (!program) {
        const err = new Error('Conteúdo não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
      assertActiveForStudent(program.status, 'Conteúdo não encontrado.');
    }
    return row;
  }
}
