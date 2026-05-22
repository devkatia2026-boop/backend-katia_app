import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ObsToTrainingsController } from '../controllers/obs-to-trainings.controller';

export function createObsToTrainingsRoutes(
  controller: ObsToTrainingsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.get('/:id', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:id', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:id', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
