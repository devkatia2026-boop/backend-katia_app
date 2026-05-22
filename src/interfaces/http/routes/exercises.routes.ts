import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ExercisesController } from '../controllers/exercises.controller';

export function createExercisesRoutes(
  controller: ExercisesController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/:exerciseId', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  return router;
}
