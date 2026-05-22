import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type {
  INewStudentRegistrationNotifier,
  NewStudentRegisteredInput,
} from '../../application/ports/new-student-registration-notifier.port';

const NOTIFICATION_TYPE = 'NEW_STUDENT_REGISTRATION';

export class SequelizeNewStudentRegistrationNotifier implements INewStudentRegistrationNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Trainer'>
  ) {}

  async notifyNewStudentRegistered(input: NewStudentRegisteredInput): Promise<void> {
    const title = 'Nova aluna no app';
    const message = `${input.studentName} foi cadastrada no app.`;

    await this.models.Notification.create({
      student_id: input.studentId,
      trainer_id: input.trainerId,
      title,
      message,
      read: false,
      type: NOTIFICATION_TYPE,
    });

    const trainer = await this.models.Trainer.findByPk(input.trainerId, {
      attributes: ['expo_push_token'],
    });
    const token = trainer?.expo_push_token?.trim();
    if (!token) {
      return;
    }

    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido para o treinador', input.trainerId);
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
          data: {
            type: NOTIFICATION_TYPE,
            studentId: input.studentId,
            trainerId: input.trainerId,
          },
        },
      ]);
      for (const chunk of chunks) {
        const tickets = await expo.sendPushNotificationsAsync(chunk);
        for (const t of tickets) {
          if (t.status === 'error') {
            console.warn('[push] Falha ao enviar notificação Expo:', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro ao enviar notificação Expo:', err);
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
