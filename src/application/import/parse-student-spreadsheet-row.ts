export type StudentSpreadsheetRow = {
  fullName: string;
  email: string;
  typePlan: 'comum' | 'exclusive';
  validation: 'sim' | 'nao';
  validationPlan: string | null;
  trainerId: string;
  wasExclusive: boolean;
  password: string;
  phone: string | null;
};

const RENOVAR_VALIDATION_PLAN = '2026-11-01';

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function formatDateOnly(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayDateOnly(): string {
  const now = new Date();
  return formatDateOnly(now);
}

function parseWasExclusive(raw: unknown): boolean {
  if (raw === true) return true;
  if (typeof raw === 'string') return raw.trim().toLowerCase() === 'true';
  return false;
}

function parseTypePlan(raw: unknown): 'comum' | 'exclusive' {
  const t = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (t === 'exclusive') return 'exclusive';
  return 'comum';
}

function parseValidade(
  raw: unknown,
  referenceToday: string
): Pick<StudentSpreadsheetRow, 'validation' | 'validationPlan'> {
  if (typeof raw === 'string') {
    const t = raw.trim().toLowerCase();
    if (t === 'renovar') {
      return { validation: 'nao', validationPlan: RENOVAR_VALIDATION_PLAN };
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
      const validation = t >= referenceToday ? 'sim' : 'nao';
      return { validation, validationPlan: t };
    }
  }

  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const iso = formatDateOnly(raw);
    const validation = iso >= referenceToday ? 'sim' : 'nao';
    return { validation, validationPlan: iso };
  }

  return { validation: 'nao', validationPlan: null };
}

export function normalizeSpreadsheetPhone(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  let t = String(raw).trim().replace(/^["']+|["']+$/g, '');
  if (t.length === 0) return null;

  const digits = t.replace(/\D/g, '');
  if (digits.length < 10) return null;

  let local = digits;
  if (local.startsWith('55') && local.length >= 12) {
    local = local.slice(2);
  }
  const ddd = local.slice(0, 2);
  const rest = local.slice(2);
  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  if (rest.length === 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return null;
}

export function parseStudentSpreadsheetRow(
  cells: unknown[],
  referenceToday: string = todayDateOnly()
): StudentSpreadsheetRow | null {
  const fullName = typeof cells[0] === 'string' ? cells[0].trim() : '';
  const emailRaw = typeof cells[1] === 'string' ? cells[1].trim().toLowerCase() : '';
  if (!fullName || !emailRaw || !emailRaw.includes('@')) {
    return null;
  }

  const typePlan = parseTypePlan(cells[2]);
  const planFields = parseValidade(cells[3], referenceToday);
  const trainerId = typeof cells[4] === 'string' ? cells[4].trim().toLowerCase() : '';
  if (!trainerId) return null;

  const wasExclusive = parseWasExclusive(cells[5]) || typePlan === 'exclusive';
  const password =
    typeof cells[6] === 'string' && cells[6].trim().length > 0 ? cells[6].trim() : 'Abc@123654';

  return {
    fullName,
    email: emailRaw,
    typePlan,
    validation: planFields.validation,
    validationPlan: planFields.validationPlan,
    trainerId,
    wasExclusive,
    password,
    phone: normalizeSpreadsheetPhone(cells[7]),
  };
}