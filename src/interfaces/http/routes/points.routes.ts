import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { PointsController } from '../controllers/points.controller';

export function createPointsRoutes(
  controller: PointsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireStudent: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.get('/:id', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireStudent], (req: Request, res: Response) =>
    controller.create(req, res)
  );

  return router;
}
