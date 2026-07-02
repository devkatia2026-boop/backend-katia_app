import { col, fn, Op, where } from 'sequelize';
import type { DatabaseModels } from './models';
import {
  brazilDateToUtcRangeEndExclusive,
  brazilDateToUtcRangeStart,
} from '../../application/parsing/set-order-schedule.parsing';
import {
  RANKING_POINTS_PER_TRAINING,
  studentPlanRankingLabel,
} from '../../application/parsing/ranking.parsing';
import type {
  IRankingsRepository,
  RankingEntry,
  RankingStudentBrief,
} from '../../application/ports/rankings.port';
import type { StudentPlanRankingType } from '../../application/parsing/ranking.parsing';

function planTypeWhere(plan: StudentPlanRankingType) {
  return where(fn('lower', fn('trim', col('Student.type_plan'))), studentPlanRankingLabel(plan));
}

function announcementType(plan: StudentPlanRankingType, month: number, year: number): string {
  return `RANKING_LAST_MONTH:${plan}:${year}-${String(month).padStart(2, '0')}`;
}

export class SequelizeRankingsRepository implements IRankingsRepository {
  constructor(
    private readonly models: Pick<DatabaseModels, 'Student' | 'Point' | 'Notification'>
  ) {}

  async listMonthlyRankingByPlan(
    plan: StudentPlanRankingType,
    monthStart: string,
    monthEnd: string
  ): Promise<RankingEntry[]> {
    const rangeStart = brazilDateToUtcRangeStart(monthStart);
    const rangeEnd = brazilDateToUtcRangeEndExclusive(monthEnd);

    const rows = (await this.models.Student.findAll({
      attributes: [
        'id',
        'full_name',
        'photo_perfil',
        'trainer_id',
        'type_plan',
        [fn('COUNT', col('points.id')), 'trainings_count'],
      ],
      where: planTypeWhere(plan),
      include: [
        {
          model: this.models.Point,
          as: 'points',
          attributes: [],
          required: false,
          where: {
            created_at: {
              [Op.gte]: rangeStart,
              [Op.lt]: rangeEnd,
            },
          },
        },
      ],
      group: ['Student.id'],
      order: [
        [fn('COUNT', col('points.id')), 'DESC'],
        ['full_name', 'ASC'],
      ],
      raw: true,
      subQuery: false,
    })) as unknown as Array<
      RankingStudentBrief & { trainings_count: string | number }
    >;

    return rows.map((row, index) => {
      const trainingsCount = Number(row.trainings_count) || 0;
      const { trainings_count: _omit, ...student } = row;
      return {
        rank: index + 1,
        student,
        trainings_count: trainingsCount,
        points: trainingsCount * RANKING_POINTS_PER_TRAINING,
      };
    });
  }

  async listStudentsByPlan(plan: StudentPlanRankingType): Promise<
    Array<{
      id: string;
      full_name: string;
      trainer_id: string;
      expo_push_token: string | null;
    }>
  > {
    const rows = await this.models.Student.findAll({
      attributes: ['id', 'full_name', 'trainer_id', 'expo_push_token'],
      where: planTypeWhere(plan),
      raw: true,
    });
    return rows as Array<{
      id: string;
      full_name: string;
      trainer_id: string;
      expo_push_token: string | null;
    }>;
  }

  async hasAnnouncementForPlanMonth(
    plan: StudentPlanRankingType,
    month: number,
    year: number
  ): Promise<boolean> {
    const type = announcementType(plan, month, year);
    const count = await this.models.Notification.count({ where: { type } });
    return count > 0;
  }
}
