export type EduzzPaidPlanUpdate = {
  type_plan: 'comum' | 'exclusive';
  validation: 'sim';
  validation_plan: string;
};

export function normalizeEduzzProducerName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

const KI_TRAINING_MENSAL = normalizeEduzzProducerName('KI TRAINING- PLANO MENSAL');
const CONSULTORIA_EXCLUSIVA_30 = normalizeEduzzProducerName('Consultoria exclusiva- 30 dias');
const CONSULTORIA_PREMIUM_3M = normalizeEduzzProducerName(
  'Consultoria Premium- 3 meses de acompanhamento'
);
const BLACK_RELAMPAGO_6M = normalizeEduzzProducerName('BLACK RELÂMPAGO: 6 MESES');

export function resolveEduzzPaidPlanUpdate(
  producerName: string,
  referenceDate: Date
): EduzzPaidPlanUpdate | null {
  const normalized = normalizeEduzzProducerName(producerName);

  if (normalized === KI_TRAINING_MENSAL) {
    return {
      type_plan: 'comum',
      validation: 'sim',
      validation_plan: addDaysToDateString(referenceDate, 30),
    };
  }
  if (normalized === CONSULTORIA_EXCLUSIVA_30) {
    return {
      type_plan: 'exclusive',
      validation: 'sim',
      validation_plan: addDaysToDateString(referenceDate, 30),
    };
  }
  if (normalized === CONSULTORIA_PREMIUM_3M) {
    return {
      type_plan: 'exclusive',
      validation: 'sim',
      validation_plan: addDaysToDateString(referenceDate, 90),
    };
  }
  if (normalized === BLACK_RELAMPAGO_6M) {
    return {
      type_plan: 'exclusive',
      validation: 'sim',
      validation_plan: addDaysToDateString(referenceDate, 180),
    };
  }

  return null;
}

function addDaysToDateString(base: Date, days: number): string {
  const date = new Date(base.getTime());
  date.setUTCDate(date.getUTCDate() + days);
  return formatValidationPlanDate(date);
}

function formatValidationPlanDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
