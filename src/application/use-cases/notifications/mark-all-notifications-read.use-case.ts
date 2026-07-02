import type { INotificationsRepository } from '../../ports/notifications.port';

export class MarkAllNotificationsReadUseCase {
  constructor(private readonly repo: INotificationsRepository) {}

  async execute(auth: { role: 'student' | 'trainer'; sub: string }): Promise<{ updated: number }> {
    const updated = await this.repo.markAllReadForViewer(auth);
    return { updated };
  }
}
