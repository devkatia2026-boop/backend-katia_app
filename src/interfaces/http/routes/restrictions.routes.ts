import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { RestrictionsController } from '../controllers/restrictions.controller';

export function createRestrictionsRoutes(
  controller: RestrictionsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireStudent: RequestHandler
): Router {
  const router = Router();
  const chain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...chain, (req: Request, res: Response) => controller.list(req, res));
  router.post('/', ...chain, (req: Request, res: Response) => controller.create(req, res));
  router.delete('/all', ...chain, (req: Request, res: Response) => controller.clearAll(req, res));
  router.delete('/:restrictionId', ...chain, (req: Request, res: Response) =>
    controller.remove(req, res)
  );

  router.post('/reports', [requireAuth, requireStudent], (req: Request, res: Response) =>
    controller.report(req, res)
  );

  return router;
}
