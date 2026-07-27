import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { AppVersionController } from '../controllers/app-version.controller';

export function createAppVersionRoutes(
  controller: AppVersionController,
  requireAuth: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/', (req: Request, res: Response) => controller.get(req, res));
  router.post('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.patch(req, res)
  );

  return router;
}
