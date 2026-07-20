import type { INoticesRepository } from '../../ports/notices.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteNoticeUseCase {
  constructor(private readonly notices: INoticesRepository) {}

  async execute(noticeId: number): Promise<void> {
    const deleted = await this.notices.deleteById(noticeId);
    if (!deleted) {
      const err = new Error('Aviso não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
