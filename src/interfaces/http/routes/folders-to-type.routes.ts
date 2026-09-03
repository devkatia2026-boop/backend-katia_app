import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { FoldersToTypeController } from '../controllers/folders-to-type.controller';

export function createFoldersToTypeRoutes(
  controller: FoldersToTypeController,
  requireAuth: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();
  const chain: RequestHandler[] = [requireAuth, requireTrainer];

  router.get('/', ...chain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:id', ...chain, (req: Request, res: Response) => controller.getById(req, res));
  router.post('/', ...chain, (req: Request, res: Response) => controller.create(req, res));
  router.patch('/:id', ...chain, (req: Request, res: Response) => controller.patch(req, res));
  router.delete('/:id', ...chain, (req: Request, res: Response) => controller.delete(req, res));

  return router;
}
