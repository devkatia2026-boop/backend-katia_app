import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { TrainingsToProgramsController } from '../controllers/trainings-to-programs.controller';

export function createTrainingsToProgramsRoutes(
  controller: TrainingsToProgramsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.post('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.create(req, res)
  );

  return router;
}
