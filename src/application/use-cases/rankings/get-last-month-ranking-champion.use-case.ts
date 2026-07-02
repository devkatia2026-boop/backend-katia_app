import {
  getBrazilMonthDays,
  getPreviousBrazilMonth,
} from '../../parsing/calendar-month.parsing';
import {
  RANKING_POINTS_PER_TRAINING,
  type StudentPlanRankingType,
} from '../../parsing/ranking.parsing';
import type { IRankingsRepository, MonthlyRankingChampionResult } from '../../ports/rankings.port';

const NOT_FOUND = 'NotFoundException';

export class GetLastMonthRankingChampionUseCase {
  constructor(private readonly rankings: IRankingsRepository) {}

  async execute(plan: StudentPlanRankingType): Promise<MonthlyRankingChampionResult> {
    const { month, year } = getPreviousBrazilMonth();
    const { month_start, month_end } = getBrazilMonthDays(year, month);
    const items = await this.rankings.listMonthlyRankingByPlan(plan, month_start, month_end);
    const champion = items.find((item) => item.trainings_count > 0) ?? null;

    if (!champion) {
      const err = new Error('Nenhuma aluna pontuou no mês anterior para este plano.');
      err.name = NOT_FOUND;
      throw err;
    }

    return {
      plan,
      month,
      year,
      month_start,
      month_end,
      points_per_training: RANKING_POINTS_PER_TRAINING,
      champion,
    };
  }
}
