import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { TrainingsController } from '../controllers/trainings.controller';

export function createTrainingsRoutes(
  controller: TrainingsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/:trainingId', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  return router;
}
