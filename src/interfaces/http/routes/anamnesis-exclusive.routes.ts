import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { AnamnesisExclusiveController } from '../controllers/anamnesis-exclusive.controller';

export function createAnamnesisExclusiveRoutes(
  controller: AnamnesisExclusiveController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();
  const chain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/students/:studentId/completion', chain, (req: Request, res: Response) =>
    controller.getCompletion(req, res)
  );
  router.get('/:studentId', chain, (req: Request, res: Response) => controller.getOne(req, res));

  return router;
}
