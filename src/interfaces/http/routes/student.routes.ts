import type { RequestHandler } from 'express';
import { Router } from 'express';
import type { StudentAnamnesisController } from '../controllers/student-anamnesis.controller';
import type { AnamnesisExclusiveController } from '../controllers/anamnesis-exclusive.controller';
import type { StudentPhysicalsController } from '../controllers/student-physicals.controller';
import type { StudentEvolutionsController } from '../controllers/student-evolutions.controller';
import type { StudentTrainingController } from '../controllers/student-training.controller';
import { createAnamnesisExclusiveUploadMiddleware } from '../middleware/anamnesis-exclusive-upload.middleware';

export function createStudentRoutes(
  anamnesisController: StudentAnamnesisController,
  anamnesisExclusiveController: AnamnesisExclusiveController,
  physicalsController: StudentPhysicalsController,
  evolutionsController: StudentEvolutionsController,
  trainingController: StudentTrainingController,
  requireAuth: RequestHandler,
  requireStudent: RequestHandler,
  anamnesisExclusiveUpload: RequestHandler,
  evolutionImageUpload: RequestHandler
): Router {
  const router = Router();
  const asStudent: RequestHandler[] = [requireAuth, requireStudent];

  router.post('/anamnesis-exclusive', ...asStudent, anamnesisExclusiveUpload, (req, res) =>
    anamnesisExclusiveController.create(req, res)
  );

  router.get('/anamnesis/history', ...asStudent, (req, res) =>
    anamnesisController.listHistory(req, res)
  );
  router.get('/anamnesis', ...asStudent, (req, res) => anamnesisController.get(req, res));
  router.post('/anamnesis', ...asStudent, (req, res) => anamnesisController.create(req, res));
  router.patch('/anamnesis', ...asStudent, (req, res) => anamnesisController.patch(req, res));

  router.get('/physicals', ...asStudent, (req, res) => physicalsController.list(req, res));
  router.post('/physicals', ...asStudent, (req, res) => physicalsController.create(req, res));
  router.get('/physicals/:physicalId', ...asStudent, (req, res) => physicalsController.getOne(req, res));
  router.patch('/physicals/:physicalId', ...asStudent, (req, res) => physicalsController.patch(req, res));

  router.get('/evolutions', ...asStudent, (req, res) => evolutionsController.list(req, res));
  router.post('/evolutions', ...asStudent, evolutionImageUpload, (req, res) =>
    evolutionsController.create(req, res)
  );
  router.get('/evolutions/:evolutionId', ...asStudent, (req, res) => evolutionsController.getOne(req, res));
  router.patch('/evolutions/:evolutionId', ...asStudent, evolutionImageUpload, (req, res) =>
    evolutionsController.patch(req, res)
  );

  router.get('/training/today', ...asStudent, (req, res) => trainingController.getToday(req, res));
  router.get('/training/week', ...asStudent, (req, res) => trainingController.getWeek(req, res));
  router.get('/training/calendar', ...asStudent, (req, res) => trainingController.getCalendar(req, res));

  return router;
}

