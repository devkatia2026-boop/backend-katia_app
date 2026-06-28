export const SUNDAY_FREE_CHOICE_MESSAGE =
  'Hoje é domingo, escolha qualquer treino ou programa';

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function formatBrazilDateFromInstant(instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(instant);
}

export function addDaysToBrazilDate(isoDate: string, deltaDays: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + deltaDays));
  return utc.toISOString().slice(0, 10);
}

export function brazilDateToUtcRangeStart(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 3, 0, 0, 0));
}

export function brazilDateToUtcRangeEndExclusive(isoDate: string): Date {
  return brazilDateToUtcRangeStart(addDaysToBrazilDate(isoDate, 1));
}

export type BrazilWeekDay = {
  date: string;
  day_of_week: number;
};

export function getBrazilWeekDays(orderLength: number, now = new Date()): {
  week_start: string;
  week_end: string;
  today: string;
  today_day_of_week: number;
  days: BrazilWeekDay[];
} {
  const { date: today, dayOfWeek: todayDayOfWeek } = getBrazilDateContext(now);
  const daysSinceMonday = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const weekStart = addDaysToBrazilDate(today, -daysSinceMonday);
  const weekDayOfWeeks = orderLength >= 7 ? [1, 2, 3, 4, 5, 6, 0] : [1, 2, 3, 4, 5, 6];
  const days = weekDayOfWeeks.map((dayOfWeek, index) => ({
    date: addDaysToBrazilDate(weekStart, index),
    day_of_week: dayOfWeek,
  }));

  return {
    week_start: weekStart,
    week_end: days[days.length - 1].date,
    today,
    today_day_of_week: todayDayOfWeek,
    days,
  };
}

export function getBrazilDateContext(now = new Date()): { date: string; dayOfWeek: number } {
  const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
  const weekdayStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'short',
  }).format(now);
  return { date, dayOfWeek: WEEKDAY_MAP[weekdayStr] ?? 0 };
}

export function parseSetOrder(raw: string | null | undefined): number[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => parseInt(part, 10))
    .filter((n) => Number.isFinite(n) && n >= 1);
}

export type ResolveTodayTrainingResult =
  | { kind: 'free_choice'; message: string }
  | { kind: 'training'; trainingId: number; orderIndex: number };

export function resolveTodayTrainingFromOrder(
  orderIds: number[],
  dayOfWeek: number
): ResolveTodayTrainingResult | null {
  if (orderIds.length === 0) return null;

  if (dayOfWeek === 0) {
    if (orderIds.length <= 6) {
      return { kind: 'free_choice', message: SUNDAY_FREE_CHOICE_MESSAGE };
    }
    return { kind: 'training', trainingId: orderIds[6], orderIndex: 6 };
  }

  const orderIndex = (dayOfWeek - 1) % orderIds.length;
  return { kind: 'training', trainingId: orderIds[orderIndex], orderIndex };
}
