import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type { IRevaluationNotifier } from '../../application/ports/revaluation-notifier.port';

const TYPE_REVALUATION_STARTED = 'REVALUATION_STARTED';
const TYPE_REVALUATION_COMPLETE_REMINDER = 'REVALUATION_COMPLETE_REMINDER';

export class SequelizeRevaluationNotifier implements IRevaluationNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(private readonly models: Pick<DatabaseModels, 'Notification'>) {}

  async notifyRevaluationStarted(
    studentId: string,
    trainerId: string,
    expoPushToken: string | null
  ): Promise<void> {
    await this.persistAndPush(
      {
        student_id: studentId,
        trainer_id: trainerId,
        title: 'Reavaliação',
        message: 'Você está em reavaliçaão, responda o questionário!',
        type: TYPE_REVALUATION_STARTED,
        data: {},
      },
      expoPushToken
    );
  }

  async notifyCompleteRevaluationReminder(
    studentId: string,
    trainerId: string,
    expoPushToken: string | null
  ): Promise<void> {
    await this.persistAndPush(
      {
        student_id: studentId,
        trainer_id: trainerId,
        title: 'Reavaliação',
        message: 'Conclua a sua reavaliação!',
        type: TYPE_REVALUATION_COMPLETE_REMINDER,
        data: {},
      },
      expoPushToken
    );
  }

  private async persistAndPush(
    row: {
      student_id: string;
      trainer_id: string;
      title: string;
      message: string;
      type: string;
      data: Record<string, unknown>;
    },
    token: string | null
  ): Promise<void> {
    await this.models.Notification.create({
      student_id: row.student_id,
      trainer_id: row.trainer_id,
      title: row.title,
      message: row.message,
      read: false,
      type: row.type,
      data: row.data,
    });
    const trimmed = token?.trim() ?? '';
    if (!trimmed) return;
    await this.sendExpoPush(trimmed, row.title, row.message, row.data);
  }

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido (revaluation)');
      return;
    }
    if (!this.expoClient) {
      this.expoClient = new Expo();
    }
    const expo = this.expoClient;
    try {
      const chunks = expo.chunkPushNotifications([{ to: token, title, body, data }]);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        for (const t of tickets) {
          if (t.status === 'error') {
            console.warn('[push] Falha Expo (revaluation):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (revaluation):', err);
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
