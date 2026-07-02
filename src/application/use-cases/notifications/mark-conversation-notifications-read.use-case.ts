import type { INotificationsRepository } from '../../ports/notifications.port';

const CONVERSATION_TYPE = 'CONVERSATION_NEW_MESSAGE';

export class MarkConversationNotificationsReadUseCase {
  constructor(private readonly repo: INotificationsRepository) {}

  async execute(auth: { role: 'student' | 'trainer'; sub: string }): Promise<{ updated: number }> {
    const updated = await this.repo.markReadByTypeForViewer(CONVERSATION_TYPE, auth);
    return { updated };
  }
}
