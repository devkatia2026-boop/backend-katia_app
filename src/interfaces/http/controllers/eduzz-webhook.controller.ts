import type { Request, Response } from 'express';
import { formatEduzzWebhookBodyForLog } from '../../../application/eduzz/eduzz-webhook-log';
import { readEduzzWebhookEvent } from '../../../application/parsing/eduzz-webhook-body.parsing';
import type { ProcessEduzzWebhookUseCase } from '../../../application/use-cases/eduzz/process-eduzz-webhook.use-case';

export class EduzzWebhookController {
  constructor(private readonly processWebhook: ProcessEduzzWebhookUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    const event = readEduzzWebhookEvent(req.body);
    const bodyForLog = formatEduzzWebhookBodyForLog(req.body);
    console.log('[eduzz-webhook] body', { event: event ?? 'desconhecido', payload: bodyForLog });

    try {
      const result = await this.processWebhook.execute(req.body);
      console.log('[eduzz-webhook] http 200', result);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message ?? 'Payload inválido.';
      if (message === 'Webhook não autorizado.') {
        console.warn('[eduzz-webhook] http 401', { event, message, payload: bodyForLog });
        res.status(401).json({ message });
        return;
      }
      console.error('[eduzz-webhook] http 400', { event, message, payload: bodyForLog });
      res.status(400).json({ message });
    }
  }
}
