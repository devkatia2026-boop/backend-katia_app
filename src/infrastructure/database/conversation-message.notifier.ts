import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type {
  ConversationMessageNotifyInput,
  IConversationMessageNotifier,
} from '../../application/ports/conversation-message-notifier.port';

const NOTIFICATION_TYPE = 'CONVERSATION_NEW_MESSAGE';

export class SequelizeConversationMessageNotifier implements IConversationMessageNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Student' | 'Trainer'>
  ) {}

  async notifyNewMessage(input: ConversationMessageNotifyInput): Promise<void> {
    const senderName = await this.resolveSenderName(input);
    const title =
      input.recipientRole === 'student' ? 'Nova mensagem da treinadora' : 'Nova mensagem da aluna';
    const message =
      input.recipientRole === 'student'
        ? `${senderName}: ${input.body}`
        : `${senderName}: ${input.body}`;

    await this.models.Notification.create({
      student_id: input.recipientRole === 'student' ? input.studentId : null,
      trainer_id: input.recipientRole === 'trainer' ? input.trainerId : null,
      title,
      message,
      read: false,
      type: NOTIFICATION_TYPE,
      data: {
        studentId: input.studentId,
        messageId: input.messageId,
      },
    });

    const token = await this.resolveRecipientToken(input);
    if (!token) {
      return;
    }

    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido para conversa', input.recipientRole);
      return;
    }

    if (!this.expoClient) {
      this.expoClient = new Expo();
    }

    try {
      const chunks = this.expoClient.chunkPushNotifications([
        {
          to: token,
          title,
          body: message,
          data: {
            type: NOTIFICATION_TYPE,
            studentId: input.studentId,
            messageId: input.messageId,
          },
        },
      ]);
      for (const chunk of chunks) {
        const tickets = await this.expoClient.sendPushNotificationsAsync(chunk);
        for (const ticket of tickets) {
          if (ticket.status === 'error') {
            console.warn('[push] Falha ao enviar push de conversa:', ticket.message, ticket.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro ao enviar push de conversa:', err);
    }
  }

  private async resolveSenderName(input: ConversationMessageNotifyInput): Promise<string> {
    if (input.senderRole === 'trainer') {
      const trainer = await this.models.Trainer.findByPk(input.trainerId, {
        attributes: ['full_name'],
      });
      return trainer?.full_name?.trim() || 'Treinadora';
    }

    const student = await this.models.Student.findByPk(input.studentId, {
      attributes: ['full_name'],
    });
    return student?.full_name?.trim() || 'Aluna';
  }

  private async resolveRecipientToken(
    input: ConversationMessageNotifyInput
  ): Promise<string | null> {
    if (input.recipientRole === 'student') {
      const student = await this.models.Student.findByPk(input.studentId, {
        attributes: ['expo_push_token'],
      });
      return student?.expo_push_token?.trim() ?? null;
    }

    const trainer = await this.models.Trainer.findByPk(input.trainerId, {
      attributes: ['expo_push_token'],
    });
    return trainer?.expo_push_token?.trim() ?? null;
  }

  private async getExpoModule(): Promise<typeof ExpoDefault> {
    if (!this.expoModule) {
      const { default: Expo } = await import('expo-server-sdk');
      this.expoModule = Expo;
    }
    return this.expoModule;
  }
}
