import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { PlaylistsController } from '../controllers/playlists.controller';

export function createPlaylistsRoutes(
  controller: PlaylistsController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  requireTrainer: RequestHandler,
  playlistImageUpload: RequestHandler
): Router {
  const router = Router();
  const readChain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...readChain, (req: Request, res: Response) => controller.list(req, res));
  router.get('/:playlistId', ...readChain, (req: Request, res: Response) =>
    controller.getById(req, res)
  );

  router.post('/', [requireAuth, requireTrainer, playlistImageUpload], (req: Request, res: Response) =>
    controller.create(req, res)
  );
  router.patch('/:playlistId', [requireAuth, requireTrainer, playlistImageUpload], (req: Request, res: Response) =>
    controller.patch(req, res)
  );
  router.delete('/:playlistId', [requireAuth, requireTrainer], (req: Request, res: Response) =>
    controller.delete(req, res)
  );

  return router;
}
