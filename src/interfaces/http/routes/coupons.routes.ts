import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { CouponsController } from '../controllers/coupons.controller';

export function createCouponsRoutes(
  controller: CouponsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  couponImageUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:couponId', ...readChain, (req: Request, res: Response) => controller.getById(req, res));

  router.post('/', [requireAuth, requireTrainer, couponImageUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:couponId', [requireAuth, requireTrainer, couponImageUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:couponId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
