import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { SemesterPromotionController } from '../controllers/semester-promotion.controller';

export function createSemesterPromotionRoutes(
  controller: SemesterPromotionController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();

  router.get('/', [requireAuth, requireStudentOrTrainer], (req: Request, res: Response) =>
    controller.get(req, res)
  );

  return router;
}
