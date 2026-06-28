import {
  getBrazilMonthDays,
  parseCalendarMonthYear,
} from '../../parsing/calendar-month.parsing';
import { formatBrazilDateFromInstant } from '../../parsing/set-order-schedule.parsing';
import type { IPointsRepository, PointDTO } from '../../ports/points.port';

export type MonthlyCalendarPointItem = Omit<PointDTO, 'student'>;

export type MonthlyTrainingCalendarDay = {
  date: string;
  day_of_week: number;
  trained: boolean;
  points: MonthlyCalendarPointItem[];
};

export type GetMonthlyTrainingCalendarResult = {
  month: number;
  year: number;
  month_start: string;
  month_end: string;
  total_days: number;
  training_days: number;
  total_points: number;
  days: MonthlyTrainingCalendarDay[];
};

export class GetMonthlyTrainingCalendarUseCase {
  constructor(private readonly points: IPointsRepository) {}

  async execute(
    studentId: string,
    rawMonth: unknown,
    rawYear: unknown
  ): Promise<GetMonthlyTrainingCalendarResult> {
    const { month, year } = parseCalendarMonthYear(rawMonth, rawYear);
    const monthContext = getBrazilMonthDays(year, month);
    const rows = await this.points.listByStudentInBrazilDateRange(
      studentId,
      monthContext.month_start,
      monthContext.month_end
    );

    const pointsByDate = new Map<string, MonthlyCalendarPointItem[]>();
    for (const row of rows) {
      const date = formatBrazilDateFromInstant(new Date(row.created_at));
      const { student: _student, ...point } = row;
      const bucket = pointsByDate.get(date);
      if (bucket) bucket.push(point);
      else pointsByDate.set(date, [point]);
    }

    const days: MonthlyTrainingCalendarDay[] = monthContext.days.map((day) => {
      const dayPoints = pointsByDate.get(day.date) ?? [];
      return {
        date: day.date,
        day_of_week: day.day_of_week,
        trained: dayPoints.length > 0,
        points: dayPoints,
      };
    });

    const trainingDays = days.filter((day) => day.trained).length;

    return {
      month,
      year,
      month_start: monthContext.month_start,
      month_end: monthContext.month_end,
      total_days: monthContext.total_days,
      training_days: trainingDays,
      total_points: rows.length,
      days,
    };
  }
}
