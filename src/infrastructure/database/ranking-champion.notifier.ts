import { col, fn, where } from 'sequelize';
import type ExpoDefault from 'expo-server-sdk';
import type { DatabaseModels } from './models';
import type {
  IRankingChampionNotifier,
  RankingChampionNotifyInput,
} from '../../application/ports/ranking-champion-notifier.port';
import { studentPlanRankingLabel } from '../../application/parsing/ranking.parsing';

function announcementType(plan: RankingChampionNotifyInput['plan'], month: number, year: number): string {
  return `RANKING_LAST_MONTH:${plan}:${year}-${String(month).padStart(2, '0')}`;
}

function planDisplayLabel(plan: RankingChampionNotifyInput['plan']): string {
  return studentPlanRankingLabel(plan);
}

export class SequelizeRankingChampionNotifier implements IRankingChampionNotifier {
  private expoClient: InstanceType<typeof ExpoDefault> | null = null;
  private expoModule: typeof ExpoDefault | null = null;

  constructor(
    private readonly models: Pick<DatabaseModels, 'Notification' | 'Trainer' | 'Student'>
  ) {}

  async notifyLastMonthChampion(input: RankingChampionNotifyInput): Promise<number> {
    const type = announcementType(input.plan, input.month, input.year);
    const planLabel = planDisplayLabel(input.plan);
    const winnerName = input.winnerName.trim() || 'Aluna';
    const title = 'Campeã do ranking';

    const students = await this.models.Student.findAll({
      attributes: ['id', 'trainer_id', 'expo_push_token'],
      where: wherePlanType(input.plan),
      raw: true,
    }) as Array<{ id: string; trainer_id: string; expo_push_token: string | null }>;

    let sent = 0;

    for (const student of students) {
      const isWinner = student.id === input.winnerStudentId;
      const message = isWinner
        ? `Parabéns, ${winnerName}! Você atingiu o primeiro lugar mês passado!`
        : `A aluna ${winnerName} foi a campeã do ranking ${planLabel} no mês passado!`;

      await this.models.Notification.create({
        student_id: student.id,
        trainer_id: student.trainer_id,
        title,
        message,
        read: false,
        type,
      });
      sent += 1;

      const token = student.expo_push_token?.trim();
      if (token) {
        await this.sendExpoPush(token, title, message, {
          type,
          plan: input.plan,
          month: input.month,
          year: input.year,
          winnerStudentId: input.winnerStudentId,
        });
      }
    }

    const trainerMessage = `Sua aluna ${winnerName} foi a campeã do ranking ${planLabel} no mês passado!`;
    await this.models.Notification.create({
      student_id: null,
      trainer_id: input.winnerTrainerId,
      title,
      message: trainerMessage,
      read: false,
      type,
    });
    sent += 1;

    const trainer = await this.models.Trainer.findByPk(input.winnerTrainerId, {
      attributes: ['expo_push_token'],
    });
    const trainerToken = trainer?.expo_push_token?.trim();
    if (trainerToken) {
      await this.sendExpoPush(trainerToken, title, trainerMessage, {
        type,
        plan: input.plan,
        month: input.month,
        year: input.year,
        winnerStudentId: input.winnerStudentId,
      });
    }

    return sent;
  }

  private async sendExpoPush(
    token: string,
    title: string,
    body: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const Expo = await this.getExpoModule();
    if (!Expo.isExpoPushToken(token)) {
      console.warn('[push] Token Expo inválido no ranking');
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
            console.warn('[push] Falha Expo (ranking):', t.message, t.details);
          }
        }
      }
    } catch (err) {
      console.error('[push] Erro Expo (ranking):', err);
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

function wherePlanType(plan: RankingChampionNotifyInput['plan']) {
  return where(fn('lower', fn('trim', col('type_plan'))), planDisplayLabel(plan));
}
