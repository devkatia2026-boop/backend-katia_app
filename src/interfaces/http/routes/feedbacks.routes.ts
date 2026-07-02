import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { FeedbacksController } from '../controllers/feedbacks.controller';

export function createFeedbacksRoutes(
  controller: FeedbacksController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireStudent: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.post('/', [requireAuth, requireStudent], (req: Request, res: Response) =>
    controller.create(req, res)
  );

  router.get('/:feedbackId/responses', ...readChain, (req: Request, res: Response) =>
    controller.listResponsesByFeedback(req, res)
  );
  router.post('/:feedbackId/responses', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.createResponse(req, res)
  );
  router.patch('/:feedbackId/responses/:responseId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.updateResponse(req, res)
  );
  router.delete('/:feedbackId/responses/:responseId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.deleteResponse(req, res)
  );

  router.get('/:id', ...readChain, (req: Request, res: Response) => controller.getById(req, res));

  return router;
}
