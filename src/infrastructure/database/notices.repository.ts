import type { DatabaseModels } from './models';
import type {
  CreateNoticeInput,
  INoticesRepository,
  NoticeDTO,
} from '../../application/ports/notices.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'trainer_id', 'message', 'type_plan', 'created_at'] as const;

export class SequelizeNoticesRepository implements INoticesRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Notice'>) {}

  async listPaged(page: number, pageSize: number): Promise<PagedList<NoticeDTO>> {
    const offset = (page - 1) * pageSize;
    const [total, rows] = await Promise.all([
      this.models.Notice.count(),
      this.models.Notice.findAll({
        attributes: [...ATTR],
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as Promise<NoticeDTO[]>,
    ]);
    return { items: rows, total, page, pageSize };
  }

  async findById(noticeId: number): Promise<NoticeDTO | null> {
    const row = await this.models.Notice.findByPk(noticeId, { attributes: [...ATTR], raw: true });
    return row ? (row as NoticeDTO) : null;
  }

  async create(input: CreateNoticeInput): Promise<NoticeDTO> {
    const row = await this.models.Notice.create(input);
    return row.get({ plain: true }) as NoticeDTO;
  }

  async deleteById(noticeId: number): Promise<boolean> {
    const n = await this.models.Notice.destroy({ where: { id: noticeId } });
    return n > 0;
  }
}
