import type { INoticesRepository, NoticeDTO } from '../../ports/notices.port';

const NOT_FOUND = 'NotFoundException';

export class GetNoticeUseCase {
  constructor(private readonly notices: INoticesRepository) {}

  async execute(noticeId: number): Promise<NoticeDTO> {
    const row = await this.notices.findById(noticeId);
    if (!row) {
      const err = new Error('Aviso não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
