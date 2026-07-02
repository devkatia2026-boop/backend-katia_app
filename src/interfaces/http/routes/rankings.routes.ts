import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { RankingsController } from '../controllers/rankings.controller';

export function createRankingsRoutes(
  controller: RankingsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler
): Router {
  const router = Router();
  const chain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/current/:plan', ...chain, (req: Request, res: Response) =>
    controller.getCurrentRanking(req, res)
  );
  router.get('/last-month/:plan/champion', ...chain, (req: Request, res: Response) =>
    controller.getLastMonthChampion(req, res)
  );

  return router;
}
