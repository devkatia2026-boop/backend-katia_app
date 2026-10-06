import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { MethodProgramsController } from '../controllers/method-programs.controller';

export function createMethodProgramsRoutes(
  controller: MethodProgramsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/:id', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.patch('/:id', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.patch(req, res)
  );

  return router;
}
