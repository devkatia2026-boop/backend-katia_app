import type { RequestHandler, Request, Response } from 'express';
import { Router } from 'express';
import type { TrainerStudentsController } from '../controllers/trainer-students.controller';
import type { TrainerTrainingsController } from '../controllers/trainer-trainings.controller';
import type { TrainerExercisesController } from '../controllers/trainer-exercises.controller';
import type { TrainerSetsController } from '../controllers/trainer-sets.controller';
import type { SetsToTrainingsController } from '../controllers/sets-to-trainings.controller';

export function createTrainerRoutes(
  studentsController: TrainerStudentsController,
  trainingsController: TrainerTrainingsController,
  exercisesController: TrainerExercisesController,
  setsController: TrainerSetsController,
  setsToTrainingsController: SetsToTrainingsController,
  requireAuth: RequestHandler,
  requireTrainer: RequestHandler
): Router {
  const router = Router();
  const asTrainer: RequestHandler[] = [requireAuth, requireTrainer];

  router.get('/sets', ...asTrainer, (req: Request, res: Response) =>
    setsController.list(req, res)
  );
  router.get('/sets/:setId', ...asTrainer, (req: Request, res: Response) =>
    setsController.getById(req, res)
  );
  router.post('/sets', ...asTrainer, (req: Request, res: Response) =>
    setsController.create(req, res)
  );
  router.patch('/sets/:setId', ...asTrainer, (req: Request, res: Response) =>
    setsController.patch(req, res)
  );
  router.delete('/sets/:setId', ...asTrainer, (req: Request, res: Response) =>
    setsController.delete(req, res)
  );

  router.get('/sets-to-trainings', ...asTrainer, (req: Request, res: Response) =>
    setsToTrainingsController.list(req, res)
  );
  router.get('/sets-to-trainings/:id', ...asTrainer, (req: Request, res: Response) =>
    setsToTrainingsController.getById(req, res)
  );
  router.post('/sets-to-trainings', ...asTrainer, (req: Request, res: Response) =>
    setsToTrainingsController.create(req, res)
  );
  router.patch('/sets-to-trainings/:id', ...asTrainer, (req: Request, res: Response) =>
    setsToTrainingsController.patch(req, res)
  );
  router.delete('/sets-to-trainings/:id', ...asTrainer, (req: Request, res: Response) =>
    setsToTrainingsController.delete(req, res)
  );

  router.get('/exercises', ...asTrainer, (req: Request, res: Response) =>
    exercisesController.list(req, res)
  );
  router.get('/exercises/:exerciseId', ...asTrainer, (req: Request, res: Response) =>
    exercisesController.getById(req, res)
  );
  router.post('/exercises', ...asTrainer, (req: Request, res: Response) =>
    exercisesController.create(req, res)
  );
  router.patch('/exercises/:exerciseId', ...asTrainer, (req: Request, res: Response) =>
    exercisesController.patch(req, res)
  );
  router.delete('/exercises/:exerciseId', ...asTrainer, (req: Request, res: Response) =>
    exercisesController.delete(req, res)
  );

  router.get('/trainings', ...asTrainer, (req: Request, res: Response) =>
    trainingsController.list(req, res)
  );
  router.get('/trainings/:trainingId', ...asTrainer, (req: Request, res: Response) =>
    trainingsController.getById(req, res)
  );
  router.post('/trainings', ...asTrainer, (req: Request, res: Response) =>
    trainingsController.create(req, res)
  );
  router.patch('/trainings/:trainingId', ...asTrainer, (req: Request, res: Response) =>
    trainingsController.patch(req, res)
  );
  router.delete('/trainings/:trainingId', ...asTrainer, (req: Request, res: Response) =>
    trainingsController.delete(req, res)
  );

  router.get('/students/search', ...asTrainer, (req, res) => studentsController.search(req, res));
  router.get('/anamneses', ...asTrainer, (req, res) => studentsController.listAnamneses(req, res));
  router.get('/students', ...asTrainer, (req, res) => studentsController.list(req, res));
  router.get(
    '/students/:studentId/anamnesis',
    ...asTrainer,
    (req, res) => studentsController.getStudentAnamnesis(req, res)
  );
  router.delete(
    '/students/:studentId/anamnesis',
    ...asTrainer,
    (req, res) => studentsController.deleteAnamnesis(req, res)
  );
  router.get(
    '/students/:studentId/physicals',
    ...asTrainer,
    (req, res) => studentsController.listStudentPhysicals(req, res)
  );
  router.get(
    '/students/:studentId/evolutions',
    ...asTrainer,
    (req, res) => studentsController.listStudentEvolutions(req, res)
  );
  router.get('/students/:studentId', ...asTrainer, (req, res) => studentsController.getOne(req, res));
  router.patch('/students/:studentId', ...asTrainer, (req, res) => studentsController.patch(req, res));

  return router;
}
