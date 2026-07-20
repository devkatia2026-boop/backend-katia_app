import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { NoticesController } from '../controllers/notices.controller';

export function createNoticesRoutes(
  controller: NoticesController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:noticeId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.delete('/:noticeId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
