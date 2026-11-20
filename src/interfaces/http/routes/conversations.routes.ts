import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ConversationsController } from '../controllers/conversations.controller';

export function createConversationsRoutes(
  controller: ConversationsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/partner', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getPartner(req, res)
  );

  router.get('/messages', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.listMessages(req, res)
  );

  router.post('/broadcast', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.broadcast(req, res)
  );

  return router;
}
