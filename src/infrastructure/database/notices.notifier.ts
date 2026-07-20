import type ExpoDefault from 'expo-server-sdk';
import { Op, type WhereOptions } from 'sequelize';
import { studentMatchesNoticeAudience } from '../../application/student-plan/student-type-plan';
import type { NoticeAudiencePlan } from '../../application/ports/notices.port';
import type { INoticesNotifier } from '../../application/ports/notices-notifier.port';
import type { DatabaseModels } from './models';
import { noticeAudiencePlanWhere } from './student-plan-eligibility';

const TYPE_NOTICE_CREATED = 'NOTICE_CREATED';

type NoticeStudentRow = {
  id: string;
  trainer_id: string;
  type_plan: string | null;
  expo_push_token: string | null;
};

export class SequelizeNoticesNotifier implements INoticesNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(private readonly models: Pick<DatabaseModels, 'Notification' | 'Student'>) {}

  async notifyNoticeCreated(
    noticeId: number,
    trainerId: string,
    message: string,
    typePlan: NoticeAudiencePlan
  ): Promise<void> {
    const planWhere = noticeAudiencePlanWhere(typePlan);
    const conditions: WhereOptions[] = [{ trainer_id: trainerId }];
    if (planWhere) {
      conditions.push(planWhere);
    }
    const where: WhereOptions =
      conditions.length === 1 ? conditions[0]! : { [Op.and]: conditions };

    const students = (await this.models.Student.findAll({
      attributes: ['id', 'trainer_id', 'type_plan', 'expo_push_token'],
      where,
      raw: true,
    })) as NoticeStudentRow[];

    const eligibleStudents = students.filter((student) =>
      studentMatchesNoticeAudience(student.type_plan, typePlan)
    );

    const pushMessage = `Tens um aviso da Kátia: ${message.trim()}`;

    for (const student of eligibleStudents) {
      try {
        await this.persistAndPush(
          {
            student_id: student.id,
            trainer_id: student.trainer_id,
            title: 'Aviso',
            message: pushMessage,
            type: TYPE_NOTICE_CREATED,
            data: { noticeId, type_plan: typePlan },
          },
          student.expo_push_token?.trim() ?? null
        );
      } catch (err) {
        console.error('[notice-notifications] student:', student.id, err);
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
      console.warn('[push] Token Expo inválido (notice)');
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
            console.warn('[push] Falha Expo (notice):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (notice):', err);
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
