import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type {
  FeedbackResponseCreatedInput,
  IFeedbackResponseNotifier,
} from '../../application/ports/feedback-response-notifier.port';

const NOTIFICATION_TYPE = 'FEEDBACK_RESPONSE_CREATED';

export class SequelizeFeedbackResponseNotifier implements IFeedbackResponseNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Student'>
  ) {}

  async notifyFeedbackResponseCreated(input: FeedbackResponseCreatedInput): Promise<void> {
    const title = 'Resposta ao feedback';
    const message = 'Sua treinadora respondeu seu feedback.';
    const data = { feedbackId: input.feedbackId };

    await this.models.Notification.create({
      student_id: input.studentId,
      trainer_id: input.trainerId,
      title,
      message,
      read: false,
      type: NOTIFICATION_TYPE,
      data,
    });

    const student = await this.models.Student.findByPk(input.studentId, {
      attributes: ['expo_push_token'],
    });
    const token = student?.expo_push_token?.trim();
    if (!token) return;

    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido para aluna', input.studentId);
      return;
    }

    if (!this.expoClient) {
      this.expoClient = new Expo();
    }
    const expo = this.expoClient;

    try {
      const chunks = expo.chunkPushNotifications([
        {
          to: token,
          title,
          body: message,
          data: { type: NOTIFICATION_TYPE, ...data },
        },
      ]);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        for (const t of tickets) {
          if (t.status === 'error') {
            console.warn('[push] Falha Expo (feedback response):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (feedback response):', err);
    }
  }

  private async getExpoModule(): Promise<typeof ExpoDefault> {
    if (!this.expoModule) {
      const { default: Expo } = await import('expo-server-sdk');
      this.expoModule = Expo;
    }
    return this.expoModule;
  }
}
