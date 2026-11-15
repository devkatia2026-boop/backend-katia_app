import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { SubjectWellsController } from '../controllers/subject-wells.controller';

export function createSubjectWellsRoutes(
  controller: SubjectWellsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  subjectFileUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:subjectWellId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer, subjectFileUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:subjectWellId', [requireAuth, requireTrainer, subjectFileUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:subjectWellId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}