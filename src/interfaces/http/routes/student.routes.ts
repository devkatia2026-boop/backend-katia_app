import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { StudentAnamnesisController } from '../controllers/student-anamnesis.controller';
import type { StudentPhysicalsController } from '../controllers/student-physicals.controller';
import type { StudentEvolutionsController } from '../controllers/student-evolutions.controller';

export function createStudentRoutes(
  anamnesisController: StudentAnamnesisController,
  physicalsController: StudentPhysicalsController,
  evolutionsController: StudentEvolutionsController,
  requireAuth: RequestHandler,
  requireStudent: RequestHandler
): Router {
  const router = Router();
  const asStudent: RequestHandler[] = [requireAuth, requireStudent];

  router.get('/anamnesis', ...asStudent, (req, res) => anamnesisController.get(req, res));
  router.post('/anamnesis', ...asStudent, (req, res) => anamnesisController.create(req, res));
  router.patch('/anamnesis', ...asStudent, (req, res) => anamnesisController.patch(req, res));

  router.get('/physicals', ...asStudent, (req, res) => physicalsController.list(req, res));
  router.post('/physicals', ...asStudent, (req, res) => physicalsController.create(req, res));
  router.get('/physicals/:physicalId', ...asStudent, (req, res) => physicalsController.getOne(req, res));
  router.patch('/physicals/:physicalId', ...asStudent, (req, res) => physicalsController.patch(req, res));

  router.get('/evolutions', ...asStudent, (req, res) => evolutionsController.list(req, res));
  router.post('/evolutions', ...asStudent, (req, res) => evolutionsController.create(req, res));
  router.get('/evolutions/:evolutionId', ...asStudent, (req, res) => evolutionsController.getOne(req, res));
  router.patch('/evolutions/:evolutionId', ...asStudent, (req, res) => evolutionsController.patch(req, res));

  return router;
}

