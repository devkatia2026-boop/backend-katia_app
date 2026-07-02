import type { DatabaseModels } from './models';
import type { INotificationsRepository, NotificationDTO } from '../../application/ports/notifications.port';
import type { PagedList } from '../../application/ports/social-feed.port';

const ATTR = ['id', 'student_id', 'trainer_id', 'title', 'message', 'read', 'type', 'data', 'created_at'] as const;

export class SequelizeNotificationsRepository implements INotificationsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Notification'>) {}

  async listForMine(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<NotificationDTO>> {
    const offset = (page - 1) * pageSize;
    const where =
      viewer.role === 'student'
        ? { student_id: viewer.sub }
        : { trainer_id: viewer.sub };

    const [total, rows] = await Promise.all([
      this.models.Notification.count({ where }),
      this.models.Notification.findAll({
        attributes: [...ATTR],
        where,
        order: [
          ['created_at', 'DESC'],
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset,
        raw: true,
      }) as unknown as Promise<NotificationDTO[]>,
    ]);

    return { items: rows, total, page, pageSize };
  }

  async findByIdForViewer(
    id: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO | null> {
    const base = { id } as Record<string, unknown>;
    const where =
      viewer.role === 'student'
        ? { ...base, student_id: viewer.sub }
        : { ...base, trainer_id: viewer.sub };

    const row = await this.models.Notification.findOne({
      attributes: [...ATTR],
      where,
      raw: true,
    });
    return (row as NotificationDTO | null) ?? null;
  }

  async markReadForViewer(
    id: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO | null> {
    const where =
      viewer.role === 'student'
        ? { id, student_id: viewer.sub }
        : { id, trainer_id: viewer.sub };

    await this.models.Notification.update({ read: true }, { where });
    return this.findByIdForViewer(id, viewer);
  }

  async markAllReadForViewer(viewer: { role: 'student' | 'trainer'; sub: string }): Promise<number> {
    const where =
      viewer.role === 'student'
        ? { student_id: viewer.sub, read: false }
        : { trainer_id: viewer.sub, read: false };

    const [count] = await this.models.Notification.update({ read: true }, { where });
    return count;
  }
}
