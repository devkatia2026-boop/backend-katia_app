import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { AuthController } from '../controllers/auth.controller';
import type { MeController } from '../controllers/me.controller';

/**
 * Rotas de autenticação.
 * Apenas mapeia HTTP para os controllers; middleware de auth é injetado na composição.
 */
export function createAuthRoutes(
  controller: AuthController,
  meController: MeController,
  requireAuth: RequestHandler
): Router {
  const router = Router();

  router.post('/register', (req, res) => controller.register(req, res));
  router.post('/confirm', (req, res) => controller.confirm(req, res));
  router.post('/login', (req, res) => controller.login(req, res));
  router.post('/refresh', (req, res) => controller.refresh(req, res));
  router.post('/forgot-password', (req, res) => controller.forgotPassword(req, res));
  router.post('/resend-forgot-password', (req, res) => controller.resendForgotPassword(req, res));
  router.post('/reset-password', (req, res) => controller.resetPassword(req, res));
  router.post('/resend-confirmation', (req, res) => controller.resendSignUpConfirmation(req, res));

  router.get('/me', requireAuth, (req, res) => meController.getMe(req, res));
  router.patch('/me', requireAuth, (req, res) => meController.patchMe(req, res));

  return router;
}
