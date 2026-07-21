import type { DatabaseModels } from './models';
import type { INotificationsRepository, NotificationDTO } from '../../application/ports/notifications.port';
import type { PagedList } from '../../application/ports/social-feed.port';
import {
  buildNotificationIdWhereForViewer,
  buildNotificationsWhereForViewer,
} from '../../application/notifications/notification-audience';

const ATTR = ['id', 'student_id', 'trainer_id', 'title', 'message', 'read', 'type', 'data', 'created_at'] as const;

export class SequelizeNotificationsRepository implements INotificationsRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'Notification'>) {}

  async listForMine(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<PagedList<NotificationDTO>> {
    const offset = (page - 1) * pageSize;
    const where = buildNotificationsWhereForViewer(viewer);

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
    const row = await this.models.Notification.findOne({
      attributes: [...ATTR],
      where: buildNotificationIdWhereForViewer(id, viewer),
      raw: true,
    });
    return (row as NotificationDTO | null) ?? null;
  }

  async markReadForViewer(
    id: number,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO | null> {
    await this.models.Notification.update(
      { read: true },
      { where: buildNotificationIdWhereForViewer(id, viewer) }
    );
    return this.findByIdForViewer(id, viewer);
  }

  async markAllReadForViewer(viewer: { role: 'student' | 'trainer'; sub: string }): Promise<number> {
    const where = {
      ...buildNotificationsWhereForViewer(viewer),
      read: false,
    };

    const [count] = await this.models.Notification.update({ read: true }, { where });
    return count;
  }

  async markReadByTypeForViewer(
    type: string,
    viewer: { role: 'student' | 'trainer'; sub: string }
  ): Promise<number> {
    const where = {
      ...buildNotificationsWhereForViewer(viewer),
      read: false,
      type,
    };

    const [count] = await this.models.Notification.update({ read: true }, { where });
    return count;
  }
}
