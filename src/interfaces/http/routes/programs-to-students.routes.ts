import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ProgramsToStudentsController } from '../controllers/programs-to-students.controller';

export function createProgramsToStudentsRoutes(
  controller: ProgramsToStudentsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireStudent: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.post('/', [requireAuth, requireStudent], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.delete('/', [requireAuth, requireStudent], (req: Request, res: Response) =>
    controller.leave(req, res)
  );

  return router;
}
