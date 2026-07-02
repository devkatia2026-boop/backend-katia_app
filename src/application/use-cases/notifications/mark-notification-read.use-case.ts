import type { INotificationsRepository, NotificationDTO } from '../../ports/notifications.port';

const NOT_FOUND = 'NotFoundException';

export class MarkNotificationReadUseCase {
  constructor(private readonly repo: INotificationsRepository) {}

  async execute(
    id: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<NotificationDTO> {
    const row = await this.repo.markReadForViewer(id, auth);
    if (!row) {
      const err = new Error('Notificação não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
