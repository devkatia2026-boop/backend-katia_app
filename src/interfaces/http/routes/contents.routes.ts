import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { ContentsController } from '../controllers/contents.controller';

export function createContentsRoutes(
  controller: ContentsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  contentFileUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:contentId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer, contentFileUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:contentId', [requireAuth, requireTrainer, contentFileUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:contentId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
