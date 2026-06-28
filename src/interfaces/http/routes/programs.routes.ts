import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ProgramsController } from '../controllers/programs.controller';

export function createProgramsRoutes(
  controller: ProgramsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  programImageUpload: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.list(req, res)
  );
  router.get('/:programId/trainings', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.listTrainings(req, res)
  );
  router.get('/:programId/students', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.listStudents(req, res)
  );
  router.get('/:programId', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer, programImageUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:programId', [requireAuth, requireTrainer, programImageUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:programId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
