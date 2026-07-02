import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { WellsController } from '../controllers/wells.controller';

export function createWellsRoutes(
  controller: WellsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  wellImageUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:wellId', ...readChain, (req: Request, res: Response) => controller.getById(req, res));

  router.post('/', [requireAuth, requireTrainer, wellImageUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:wellId', [requireAuth, requireTrainer, wellImageUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:wellId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
