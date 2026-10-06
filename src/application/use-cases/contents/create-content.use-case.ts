import { parseContentCreateBody } from '../../parsing/contents-body.parsing';
import type { ContentDTO, IContentsRepository } from '../../ports/contents.port';
import type { IIntroductionsRepository } from '../../ports/introductions.port';

const NOT_FOUND = 'NotFoundException';

export class CreateContentUseCase {
  constructor(
    private readonly contents: IContentsRepository,
    private readonly introductions: IIntroductionsRepository
  ) {}

  async execute(body: unknown): Promise<ContentDTO> {
    const input = parseContentCreateBody(body);
    const intro = await this.introductions.findById(input.introduction_id);
    if (!intro) {
      const err = new Error('Introdução não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.contents.create(input);
  }
}
