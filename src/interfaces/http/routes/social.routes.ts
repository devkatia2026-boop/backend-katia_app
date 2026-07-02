import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { SocialFeedController } from '../controllers/social-feed.controller';

export function createSocialRoutes(
  controller: SocialFeedController,
  requireAuth: RequestHandler,
  requireStudentOrTrainer: RequestHandler,
  postImageUpload: RequestHandler
): Router {
  const router = Router();
  const chain: RequestHandler[] = [requireAuth, requireStudentOrTrainer];

  router.get('/', ...chain, (req, res) => controller.postList(req, res));
  router.get('/:postId/comments', ...chain, (req, res) => controller.commentList(req, res));
  router.get('/:postId/likes', ...chain, (req, res) => controller.likeList(req, res));
  router.get('/:postId', ...chain, (req, res) => controller.postGet(req, res));
  router.post('/', ...chain, postImageUpload, (req, res) => controller.postCreate(req, res));
  router.post('/:postId/comments', ...chain, (req, res) => controller.commentCreate(req, res));
  router.patch('/:postId/comments/:commentId', ...chain, (req, res) => controller.commentPatch(req, res));
  router.delete('/:postId/comments/:commentId', ...chain, (req, res) => controller.commentDelete(req, res));
  router.post('/:postId/like', ...chain, (req, res) => controller.likeAdd(req, res));
  router.delete('/:postId/like', ...chain, (req, res) => controller.likeRemove(req, res));
  router.patch('/:postId', ...chain, postImageUpload, (req, res) => controller.postPatch(req, res));
  router.delete('/:postId', ...chain, (req, res) => controller.postDelete(req, res));

  return router;
}
