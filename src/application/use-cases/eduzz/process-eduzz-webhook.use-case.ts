import {
  isEduzzConnectivityEvent,
  parseEduzzWebhookBody,
  readEduzzWebhookEvent,
} from '../../parsing/eduzz-webhook-body.parsing';
import { resolveEduzzPaidPlanUpdate } from '../../eduzz/eduzz-producer-plans';
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
    const eventPreview = readEduzzWebhookEvent(body);
    console.log('[eduzz-webhook] recebido', {
      event: eventPreview ?? 'desconhecido',
    });

    if (eventPreview && isEduzzConnectivityEvent(eventPreview)) {
      console.log('[eduzz-webhook] verificacao de conectividade', { event: eventPreview });
      return {
        processed: true,
        event: eventPreview,
        action: 'ignored',
        reason: 'Evento de verificacao.',
      };
    }

    const parsed = parseEduzzWebhookBody(body);
    console.log('[eduzz-webhook] payload valido', {
      event: parsed.event,
      buyerEmail: parsed.buyerEmail,
      producerName: parsed.producerName,
      hasOriginSecret: parsed.originSecret !== null,
    });

    if (this.webhookSecret !== null) {
      if (parsed.originSecret !== this.webhookSecret) {
        console.warn('[eduzz-webhook] originSecret invalido', {
          event: parsed.event,
          buyerEmail: parsed.buyerEmail,
        });
        throw new Error('Webhook não autorizado.');
      }
    }

    if (parsed.event === INVOICE_PAID) {
      const planUpdate = resolveEduzzPaidPlanUpdate(parsed.producerName, receivedAt);
      if (!planUpdate) {
        console.log('[eduzz-webhook] produtor nao mapeado', {
          event: parsed.event,
          producerName: parsed.producerName,
          buyerEmail: parsed.buyerEmail,
        });
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
        console.log('[eduzz-webhook] aluna nao encontrada', {
          event: parsed.event,
          buyerEmail: parsed.buyerEmail,
          producerName: parsed.producerName,
        });
        return {
          processed: false,
          event: parsed.event,
          action: 'ignored',
          reason: 'Aluna não encontrada.',
        };
      }

      console.log('[eduzz-webhook] plano atualizado', {
        event: parsed.event,
        student_id: result.student_id,
        type_plan: planUpdate.type_plan,
        validation_plan: planUpdate.validation_plan,
      });

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
        console.log('[eduzz-webhook] aluna nao encontrada para limpar plano', {
          event: parsed.event,
          buyerEmail: parsed.buyerEmail,
        });
        return {
          processed: false,
          event: parsed.event,
          action: 'ignored',
          reason: 'Aluna não encontrada.',
        };
      }

      console.log('[eduzz-webhook] plano limpo', {
        event: parsed.event,
        student_id: result.student_id,
      });

      return {
        processed: true,
        event: parsed.event,
        action: 'plan_cleared',
        student_id: result.student_id,
      };
    }

    console.log('[eduzz-webhook] evento nao suportado', { event: parsed.event });
    return {
      processed: false,
      event: parsed.event,
      action: 'ignored',
      reason: 'Evento não suportado.',
    };
  }
}
