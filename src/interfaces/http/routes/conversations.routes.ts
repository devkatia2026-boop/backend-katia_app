import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ConversationsController } from '../controllers/conversations.controller';

export function createConversationsRoutes(
  controller: ConversationsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/messages', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.listMessages(req, res)
  );

  return router;
}
