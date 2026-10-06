import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { IntroductionsController } from '../controllers/introductions.controller';

export function createIntroductionsRoutes(
  controller: IntroductionsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:introductionId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:introductionId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:introductionId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
