import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { SetsController } from '../controllers/sets.controller';

export function createSetsRoutes(
  controller: SetsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/:setId', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  return router;
}
