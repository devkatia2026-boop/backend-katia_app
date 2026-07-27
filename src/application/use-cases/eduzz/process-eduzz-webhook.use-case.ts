import { resolveEduzzPaidPlanUpdate } from '../../eduzz/eduzz-producer-plans';
import { parseEduzzWebhookBody } from '../../parsing/eduzz-webhook-body.parsing';
import type { IEduzzStudentPlanRepository } from '../../ports/eduzz-webhook.port';

export type ProcessEduzzWebhookResult = {
  processed: boolean;
  event: string;
  action: 'plan_updated' | 'plan_cleared' | 'ignored';
  student_id?: string;
  reason?: string;
};

const INVOICE_PAID = 'myeduzz.invoice_paid';
const INVOICE_REFUNDED = 'myeduzz.invoice_refunded';
const INVOICE_CANCELED = 'myeduzz.invoice_canceled';

export class ProcessEduzzWebhookUseCase {
  constructor(
    private readonly repository: IEduzzStudentPlanRepository,
    private readonly webhookSecret: string | null
  ) {}

  async execute(body: unknown, receivedAt = new Date()): Promise<ProcessEduzzWebhookResult> {
    const parsed = parseEduzzWebhookBody(body);

    if (this.webhookSecret !== null) {
      if (parsed.originSecret !== this.webhookSecret) {
        throw new Error('Webhook não autorizado.');
      }
    }

    if (parsed.event === INVOICE_PAID) {
      const planUpdate = resolveEduzzPaidPlanUpdate(parsed.producerName, receivedAt);
      if (!planUpdate) {
        return {
          processed: false,
          event: parsed.event,
          action: 'ignored',
          reason: 'Produtor não mapeado.',
        };
      }

      const result = await this.repository.applyPaidPlanByEmail(parsed.buyerEmail, {
        type_plan: planUpdate.type_plan,
        validation: planUpdate.validation,
        validation_plan: planUpdate.validation_plan,
      });

      if (!result) {
        return {
          processed: false,
          event: parsed.event,
          action: 'ignored',
          reason: 'Aluna não encontrada.',
        };
      }

      return {
        processed: true,
        event: parsed.event,
        action: 'plan_updated',
        student_id: result.student_id,
      };
    }

    if (parsed.event === INVOICE_REFUNDED || parsed.event === INVOICE_CANCELED) {
      const result = await this.repository.clearPlanByEmail(parsed.buyerEmail);
      if (!result) {
        return {
          processed: false,
          event: parsed.event,
          action: 'ignored',
          reason: 'Aluna não encontrada.',
        };
      }

      return {
        processed: true,
        event: parsed.event,
        action: 'plan_cleared',
        student_id: result.student_id,
      };
    }

    return {
      processed: false,
      event: parsed.event,
      action: 'ignored',
      reason: 'Evento não suportado.',
    };
  }
}
