import { getBrazilDateContext } from './set-order-schedule.parsing';

const VALIDATION = 'ValidationException';

function firstQuery(value: unknown): unknown {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseOptionalPositiveInt(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const raw = String(firstQuery(value)).trim();
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    const err = new Error(`${field} inválido.`);
    err.name = VALIDATION;
    throw err;
  }
  return n;
}

export function parseCalendarMonthYear(
  rawMonth: unknown,
  rawYear: unknown,
  now = new Date()
): { month: number; year: number } {
  const { date: today } = getBrazilDateContext(now);
  const [currentYear, currentMonth] = today.split('-').map(Number);

  const month = parseOptionalPositiveInt(rawMonth, 'month') ?? currentMonth;
  const year = parseOptionalPositiveInt(rawYear, 'year') ?? currentYear;

  if (month < 1 || month > 12) {
    const err = new Error('month deve estar entre 1 e 12.');
    err.name = VALIDATION;
    throw err;
  }
  if (year < 2000 || year > 2100) {
    const err = new Error('year inválido.');
    err.name = VALIDATION;
    throw err;
  }

  return { month, year };
}

export function getBrazilDayOfWeek(isoDate: string): number {
  const [year, month, day] = isoDate.split('-').map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day, 15, 0, 0, 0));
  return getBrazilDateContext(instant).dayOfWeek;
}

export function getBrazilMonthDays(year: number, month: number): {
  month_start: string;
  month_end: string;
  total_days: number;
  days: Array<{ date: string; day_of_week: number }>;
} {
  const monthLabel = String(month).padStart(2, '0');
  const monthStart = `${year}-${monthLabel}-01`;
  const totalDays = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days: Array<{ date: string; day_of_week: number }> = [];

  for (let day = 1; day <= totalDays; day++) {
    const date = `${year}-${monthLabel}-${String(day).padStart(2, '0')}`;
    days.push({ date, day_of_week: getBrazilDayOfWeek(date) });
  }

  return {
    month_start: monthStart,
    month_end: days[days.length - 1].date,
    total_days: totalDays,
    days,
  };
}
