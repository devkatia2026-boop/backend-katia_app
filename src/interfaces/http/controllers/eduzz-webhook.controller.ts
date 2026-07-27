import type { Request, Response } from 'express';
import type { ProcessEduzzWebhookUseCase } from '../../../application/use-cases/eduzz/process-eduzz-webhook.use-case';

export class EduzzWebhookController {
  constructor(private readonly processWebhook: ProcessEduzzWebhookUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.processWebhook.execute(req.body);
      res.status(200).json(result);
    } catch (err) {
      const error = err as { message?: string };
      const message = error.message ?? 'Payload inválido.';
      if (message === 'Webhook não autorizado.') {
        res.status(401).json({ message });
        return;
      }
      res.status(400).json({ message });
    }
  }
}
