import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { StudentSharedController } from '../controllers/student-shared.controller';

export function createStudentSharedRoutes(
  controller: StudentSharedController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/:studentId/was-exclusive', ...readChain, (req: Request, res: Response) =>
    controller.getWasExclusive(req, res)
  );

  return router;
}
