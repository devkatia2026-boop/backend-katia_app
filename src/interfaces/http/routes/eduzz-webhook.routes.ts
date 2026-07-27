import type { Request, Response } from 'express';
import { Router } from 'express';
import type { EduzzWebhookController } from '../controllers/eduzz-webhook.controller';

export function createEduzzWebhookRoutes(controller: EduzzWebhookController): Router {
  const router = Router();

  router.post('/', (req: Request, res: Response) => controller.handle(req, res));

  return router;
}
