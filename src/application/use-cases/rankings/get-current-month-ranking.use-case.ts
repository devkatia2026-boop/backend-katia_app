import {
  getBrazilMonthDays,
  parseCalendarMonthYear,
} from '../../parsing/calendar-month.parsing';
import {
  RANKING_POINTS_PER_TRAINING,
  type StudentPlanRankingType,
} from '../../parsing/ranking.parsing';
import type { IRankingsRepository, MonthlyRankingResult } from '../../ports/rankings.port';

export class GetCurrentMonthRankingUseCase {
  constructor(private readonly rankings: IRankingsRepository) {}

  async execute(plan: StudentPlanRankingType): Promise<MonthlyRankingResult> {
    const { month, year } = parseCalendarMonthYear(undefined, undefined);
    const { month_start, month_end } = getBrazilMonthDays(year, month);
    const items = await this.rankings.listMonthlyRankingByPlan(plan, month_start, month_end);
    const leader = items.find((item) => item.trainings_count > 0) ?? null;

    return {
      plan,
      month,
      year,
      month_start,
      month_end,
      points_per_training: RANKING_POINTS_PER_TRAINING,
      leader,
      items,
    };
  }
}
