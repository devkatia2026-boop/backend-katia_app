import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type {
  ISetValidityNotifier,
  SetValidityReminderMilestone,
  SetValidityReminderNotifyInput,
} from '../../application/ports/set-validity-notifier.port';

const TYPE_BY_MILESTONE: Record<SetValidityReminderMilestone, string> = {
  '7d': 'SET_VALIDITY_REMINDER_7D',
  '3d': 'SET_VALIDITY_REMINDER_3D',
  today: 'SET_VALIDITY_REMINDER_TODAY',
  past: 'SET_VALIDITY_PAST',
};

export class SequelizeSetValidityNotifier implements ISetValidityNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Trainer'>
  ) {}

  async notifyTrainerSetValidityReminder(
    input: SetValidityReminderNotifyInput
  ): Promise<boolean> {
    const baseType = TYPE_BY_MILESTONE[input.milestone];

    const existing = await this.models.Notification.count({
      where: {
        type: baseType,
        trainer_id: input.trainer_id,
        ...(input.milestone === 'past'
          ? {
              data: {
                setToStudentId: input.id,
                reminderDate: input.todayIso,
              },
            }
          : {
              data: {
                setToStudentId: input.id,
                validity: input.validity,
              },
            }),
      },
    });

    if (existing > 0) {
      return false;
    }

    const setLabel = input.set_name?.trim() || 'Rotina';
    const studentName = input.student_name.trim() || 'Aluna';
    const { title, message } = buildCopy(input.milestone, studentName, setLabel, input.validity);

    await this.models.Notification.create({
      student_id: input.student_id,
      trainer_id: input.trainer_id,
      title,
      message,
      read: false,
      type: baseType,
      data: {
        type: baseType,
        studentId: input.student_id,
        setToStudentId: input.id,
        setsId: input.sets_id,
        validity: input.validity,
        milestone: input.milestone,
        ...(input.milestone === 'past' ? { reminderDate: input.todayIso } : {}),
      },
    });

    const token =
      input.trainer_expo_push_token?.trim() ||
      (await this.getTrainerPushToken(input.trainer_id));

    if (!token) {
      return true;
    }

    await this.sendExpoPush(token, title, message, {
      type: baseType,
      studentId: input.student_id,
      setToStudentId: input.id,
      setsId: input.sets_id,
      validity: input.validity,
      milestone: input.milestone,
    });

    return true;
  }

  private async getTrainerPushToken(trainerId: string): Promise<string | null> {
    const trainer = await this.models.Trainer.findByPk(trainerId, {
      attributes: ['expo_push_token'],
    });

    return trainer?.expo_push_token?.trim() ?? null;
  }

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const Expo = await this.getExpoModule();

    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido (set-validity)');
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

        for (const ticket of tickets) {
          if (ticket.status === 'error') {
            console.warn('[push] Falha Expo (set-validity):', ticket.message, ticket.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (set-validity):', err);
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

function buildCopy(
  milestone: SetValidityReminderMilestone,
  studentName: string,
  setLabel: string,
  validity: string
): { title: string; message: string } {
  switch (milestone) {
    case '7d':
      return {
        title: 'Validade da rotina',
        message: `A rotina "${setLabel}" de ${studentName} vence em 7 dias (${validity}).`,
      };
    case '3d':
      return {
        title: 'Validade da rotina',
        message: `A rotina "${setLabel}" de ${studentName} vence em 3 dias (${validity}).`,
      };
    case 'today':
      return {
        title: 'Validade da rotina',
        message: `A rotina "${setLabel}" de ${studentName} vence hoje (${validity}).`,
      };
    default:
      return {
        title: 'Rotina vencida',
        message: `A rotina "${setLabel}" de ${studentName} está vencida desde ${validity}.`,
      };
  }
}
