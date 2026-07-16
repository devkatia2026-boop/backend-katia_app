import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { MediaController } from '../controllers/media.controller';

export function createMediaRoutes(
  controller: MediaController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
): Router {
  const router = Router();

  router.get('/remote', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.remote(req, res),
  );

  return router;
}
