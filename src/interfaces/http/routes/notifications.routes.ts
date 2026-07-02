import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { NotificationsController } from '../controllers/notifications.controller';

export function createNotificationsRoutes(
  controller: NotificationsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.patch('/read-all', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.markAllRead(req, res)
  );
  router.patch('/:id/read', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.markRead(req, res)
  );
  router.get('/:id', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  return router;
}
