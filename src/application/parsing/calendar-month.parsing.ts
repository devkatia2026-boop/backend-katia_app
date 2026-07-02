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

export function getPreviousBrazilMonth(now = new Date()): { month: number; year: number } {
  const { month, year } = parseCalendarMonthYear(undefined, undefined, now);
  if (month === 1) {
    return { month: 12, year: year - 1 };
  }
  return { month: month - 1, year };
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

export function getBrazilDateTimeParts(now = new Date()): {
  day: number;
  hour: number;
  minute: number;
} {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return { day, hour, minute };
}

export function isBrazilFirstDayOnOrAfterHour(hour: number, now = new Date()): boolean {
  const { day, hour: currentHour } = getBrazilDateTimeParts(now);
  return day === 1 && currentHour >= hour;
}

const ONE_MINUTE_MS = 60_000;

export function msUntilNextBrazilTime(
  targetHour: number,
  targetMinute = 0,
  now = new Date()
): number {
  const nowMs = now.getTime();
  const maxMinutes = 48 * 60;

  for (let minutes = 1; minutes <= maxMinutes; minutes++) {
    const candidateMs = nowMs + minutes * ONE_MINUTE_MS;
    const { hour, minute } = getBrazilDateTimeParts(new Date(candidateMs));
    if (hour === targetHour && minute === targetMinute) {
      return minutes * ONE_MINUTE_MS;
    }
  }

  return 24 * 60 * ONE_MINUTE_MS;
}
