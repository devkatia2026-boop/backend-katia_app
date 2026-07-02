import {
  getBrazilMonthDays,
  getPreviousBrazilMonth,
} from '../../parsing/calendar-month.parsing';
import {
  RANKING_POINTS_PER_TRAINING,
  type StudentPlanRankingType,
} from '../../parsing/ranking.parsing';
import type { IRankingChampionNotifier } from '../../ports/ranking-champion-notifier.port';
import type { IRankingsRepository, RankingEntry } from '../../ports/rankings.port';

const PLANS: StudentPlanRankingType[] = ['comum', 'exclusive'];

export type SendLastMonthRankingChampionPlanResult = {
  plan: StudentPlanRankingType;
  month: number;
  year: number;
  champion: RankingEntry | null;
  notifications_sent: number;
  skipped_reason: 'no_champion' | 'already_announced' | null;
};

export type SendLastMonthRankingChampionNotificationsResult = {
  month: number;
  year: number;
  month_start: string;
  month_end: string;
  points_per_training: number;
  plans: SendLastMonthRankingChampionPlanResult[];
};

export class SendLastMonthRankingChampionNotificationsUseCase {
  constructor(
    private readonly rankings: IRankingsRepository,
    private readonly notifier: IRankingChampionNotifier
  ) {}

  async execute(): Promise<SendLastMonthRankingChampionNotificationsResult> {
    const { month, year } = getPreviousBrazilMonth();
    const { month_start, month_end } = getBrazilMonthDays(year, month);
    const plans: SendLastMonthRankingChampionPlanResult[] = [];

    for (const plan of PLANS) {
      plans.push(await this.processPlan(plan, month, year, month_start, month_end));
    }

    return {
      month,
      year,
      month_start,
      month_end,
      points_per_training: RANKING_POINTS_PER_TRAINING,
      plans,
    };
  }

  private async processPlan(
    plan: StudentPlanRankingType,
    month: number,
    year: number,
    monthStart: string,
    monthEnd: string
  ): Promise<SendLastMonthRankingChampionPlanResult> {
    const items = await this.rankings.listMonthlyRankingByPlan(plan, monthStart, monthEnd);
    const champion = items.find((item) => item.trainings_count > 0) ?? null;

    if (!champion) {
      return {
        plan,
        month,
        year,
        champion: null,
        notifications_sent: 0,
        skipped_reason: 'no_champion',
      };
    }

    const alreadyAnnounced = await this.rankings.hasAnnouncementForPlanMonth(plan, month, year);
    if (alreadyAnnounced) {
      return {
        plan,
        month,
        year,
        champion,
        notifications_sent: 0,
        skipped_reason: 'already_announced',
      };
    }

    const notificationsSent = await this.notifier.notifyLastMonthChampion({
      plan,
      month,
      year,
      winnerStudentId: champion.student.id,
      winnerName: champion.student.full_name,
      winnerTrainerId: champion.student.trainer_id,
    });

    return {
      plan,
      month,
      year,
      champion,
      notifications_sent: notificationsSent,
      skipped_reason: null,
    };
  }
}
