import { parseContentPatchBody } from '../../parsing/contents-body.parsing';
import type { ContentDTO, IContentsRepository } from '../../ports/contents.port';
import type { IIntroductionsRepository } from '../../ports/introductions.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateContentUseCase {
  constructor(
    private readonly contents: IContentsRepository,
    private readonly introductions: IIntroductionsRepository
  ) {}

  async execute(contentId: number, body: unknown): Promise<ContentDTO> {
    const patch = parseContentPatchBody(body);
    if (patch.introduction_id !== undefined) {
      const intro = await this.introductions.findById(patch.introduction_id);
      if (!intro) {
        const err = new Error('Introdução não encontrada.');
        err.name = NOT_FOUND;
        throw err;
      }
    }
    return this.contents.update(contentId, patch);
  }
}
