import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { WellbeingController } from '../controllers/wellbeing.controller';

export function createWellbeingRoutes(
  controller: WellbeingController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  wellbeingImageUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:wellbeingId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer, wellbeingImageUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:wellbeingId', [requireAuth, requireTrainer, wellbeingImageUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:wellbeingId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
