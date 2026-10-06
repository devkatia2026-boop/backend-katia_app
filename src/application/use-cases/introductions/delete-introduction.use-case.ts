import type { IIntroductionsRepository } from '../../ports/introductions.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteIntroductionUseCase {
  constructor(private readonly introductions: IIntroductionsRepository) {}

  async execute(introductionId: number): Promise<void> {
    const ok = await this.introductions.deleteById(introductionId);
    if (!ok) {
      const err = new Error('Introdução não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
