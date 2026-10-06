import type { IContentsRepository } from '../../ports/contents.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteContentUseCase {
  constructor(private readonly contents: IContentsRepository) {}

  async execute(contentId: number): Promise<void> {
    const ok = await this.contents.deleteById(contentId);
    if (!ok) {
      const err = new Error('Conteúdo não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
