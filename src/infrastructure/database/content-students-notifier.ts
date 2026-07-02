import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type { IContentStudentsNotifier } from '../../application/ports/content-students-notifier.port';

const TYPE_COUPON_CREATED = 'COUPON_CREATED';
const TYPE_WELLBEING_CREATED = 'WELLBEING_CREATED';

export class SequelizeContentStudentsNotifier implements IContentStudentsNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(private readonly models: Pick<DatabaseModels, 'Notification' | 'Student'>) {}

  async notifyCouponCreated(couponId: number): Promise<void> {
    await this.notifyAllStudents({
      title: 'Novo cupom',
      message: 'A Kátia adicionou um cumpom! Corre e aproveita!',
      type: TYPE_COUPON_CREATED,
      data: { couponId },
    });
  }

  async notifyWellbeingCreated(wellbeingId: number): Promise<void> {
    await this.notifyAllStudents({
      title: 'Novo bem-estar',
      message: 'Checa o novo bem estar',
      type: TYPE_WELLBEING_CREATED,
      data: { wellbeingId },
    });
  }

  private async notifyAllStudents(input: {
    title: string;
    message: string;
    type: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    const students = await this.models.Student.findAll({
      attributes: ['id', 'trainer_id', 'expo_push_token'],
      raw: true,
    }) as Array<{ id: string; trainer_id: string; expo_push_token: string | null }>;

    for (const student of students) {
      try {
        await this.persistAndPush(
          {
            student_id: student.id,
            trainer_id: student.trainer_id,
            title: input.title,
            message: input.message,
            type: input.type,
            data: input.data,
          },
          student.expo_push_token?.trim() ?? null
        );
      } catch (err) {
        console.error('[content-notifications] student:', student.id, err);
      }
    }
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
    if (!token) return;
    await this.sendExpoPush(token, row.title, row.message, row.data);
  }

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido (content)');
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
            console.warn('[push] Falha Expo (content):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (content):', err);
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
