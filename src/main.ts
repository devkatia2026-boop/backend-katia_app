import 'dotenv/config';
import './interfaces/http/types/express-augment';
import express, { Request, Response } from 'express';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import { createAuthRoutes } from './interfaces/http/routes/auth.routes';
import { AuthController } from './interfaces/http/controllers/auth.controller';
import { MeController } from './interfaces/http/controllers/me.controller';
import { createRequireAuth } from './interfaces/http/middleware/create-require-auth.middleware';
import { CognitoAuthAdapter } from './infrastructure/auth/cognito/cognito-auth.adapter';
import { CognitoAccessTokenVerifier } from './infrastructure/auth/cognito/cognito-access-token.verifier';
import { CognitoUserAttributesUpdater } from './infrastructure/auth/cognito/cognito-user-attributes.updater';
import { models } from './infrastructure/database';
import { SequelizeUserProfileWriter } from './infrastructure/database/user-profile.writer';
import { SequelizeNewStudentRegistrationNotifier } from './infrastructure/database/new-student-registration.notifier';
import { ResolveGoogleAuthUseCase } from './application/use-cases/auth/resolve-google-auth.use-case';
import { RegisterUserProfileUseCase } from './application/use-cases/auth/register-user-profile.use-case';
import { ConfirmSignUpUseCase } from './application/use-cases/auth/confirm-sign-up.use-case';
import { SignInWithRefreshPersistenceUseCase } from './application/use-cases/auth/sign-in-with-refresh-persistence.use-case';
import { SequelizeLoginRefreshTokenWriter } from './infrastructure/database/login-refresh-token.writer';
import { SequelizeUserMeReader } from './infrastructure/database/user-me.reader';
import { SequelizeUserProfileUpdater } from './infrastructure/database/user-profile.updater';
import { RefreshSessionUseCase } from './application/use-cases/auth/refresh-session.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/auth/reset-password.use-case';
import { ResendSignUpConfirmationUseCase } from './application/use-cases/auth/resend-sign-up-confirmation.use-case';
import { GetMeUseCase } from './application/use-cases/auth/get-me.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/auth/update-my-profile.use-case';
import { swaggerDocument } from './swagger';
import { createTrainerRoutes } from './interfaces/http/routes/trainer.routes';
import { createRequireTrainer } from './interfaces/http/middleware/create-require-trainer.middleware';
import { createStudentRoutes } from './interfaces/http/routes/student.routes';
import { createRequireStudent } from './interfaces/http/middleware/create-require-student.middleware';
import { SequelizeTrainerStudentsRepository } from './infrastructure/database/trainer-students.repository';
import { ListTrainerStudentsUseCase } from './application/use-cases/trainer/list-trainer-students.use-case';
import { SearchTrainerStudentsUseCase } from './application/use-cases/trainer/search-trainer-students.use-case';
import { GetTrainerStudentUseCase } from './application/use-cases/trainer/get-trainer-student.use-case';
import { UpdateTrainerStudentUseCase } from './application/use-cases/trainer/update-trainer-student.use-case';
import { DeleteTrainerStudentAnamnesisUseCase } from './application/use-cases/trainer/delete-trainer-student-anamnesis.use-case';
import { ListTrainerStudentsAnamnesesUseCase } from './application/use-cases/trainer/list-trainer-students-anamneses.use-case';
import { GetTrainerStudentAnamnesisUseCase } from './application/use-cases/trainer/get-trainer-student-anamnesis.use-case';
import { TrainerStudentsController } from './interfaces/http/controllers/trainer-students.controller';
import { SequelizeStudentAnamnesisRepository } from './infrastructure/database/student-anamnesis.repository';
import { CreateMyAnamnesisUseCase } from './application/use-cases/student/create-my-anamnesis.use-case';
import { UpdateMyAnamnesisUseCase } from './application/use-cases/student/update-my-anamnesis.use-case';
import { GetMyAnamnesisUseCase } from './application/use-cases/student/get-my-anamnesis.use-case';
import { ListMyAnamnesisHistoryUseCase } from './application/use-cases/student/list-my-anamnesis-history.use-case';
import { StudentAnamnesisController } from './interfaces/http/controllers/student-anamnesis.controller';
import { SequelizeAnamnesisExclusiveRepository } from './infrastructure/database/anamnesis-exclusive.repository';
import { CreateMyAnamnesisExclusiveUseCase } from './application/use-cases/anamnesis-exclusive/create-my-anamnesis-exclusive.use-case';
import { GetAnamnesisExclusiveByStudentIdUseCase } from './application/use-cases/anamnesis-exclusive/get-anamnesis-exclusive-by-id.use-case';
import { GetAnamnesisExclusiveCompletionUseCase } from './application/use-cases/anamnesis-exclusive/get-anamnesis-exclusive-completion.use-case';
import { UploadAnamnesisExclusiveFilesUseCase } from './application/use-cases/anamnesis-exclusive/upload-anamnesis-exclusive-files.use-case';
import { UploadImageFilesUseCase } from './application/use-cases/media/upload-image-files.use-case';
import { AnamnesisExclusiveController } from './interfaces/http/controllers/anamnesis-exclusive.controller';
import { createAnamnesisExclusiveRoutes } from './interfaces/http/routes/anamnesis-exclusive.routes';
import { createAnamnesisExclusiveUploadMiddleware } from './interfaces/http/middleware/anamnesis-exclusive-upload.middleware';
import { createImageUploadMiddleware } from './interfaces/http/middleware/create-image-upload.middleware';
import type { IObjectStorage } from './application/ports/object-storage.port';
import { S3ObjectStorageAdapter } from './infrastructure/storage/s3-object-storage.adapter';
import { SequelizeStudentPhysicalsRepository } from './infrastructure/database/student-physicals.repository';
import { SequelizeStudentEvolutionsRepository } from './infrastructure/database/student-evolutions.repository';
import { ListMyPhysicalsUseCase } from './application/use-cases/student/list-my-physicals.use-case';
import { GetMyPhysicalUseCase } from './application/use-cases/student/get-my-physical.use-case';
import { CreateMyPhysicalUseCase } from './application/use-cases/student/create-my-physical.use-case';
import { UpdateMyPhysicalUseCase } from './application/use-cases/student/update-my-physical.use-case';
import { ListMyEvolutionsUseCase } from './application/use-cases/student/list-my-evolutions.use-case';
import { GetMyEvolutionUseCase } from './application/use-cases/student/get-my-evolution.use-case';
import { CreateMyEvolutionUseCase } from './application/use-cases/student/create-my-evolution.use-case';
import { UpdateMyEvolutionUseCase } from './application/use-cases/student/update-my-evolution.use-case';
import { ListTrainerStudentPhysicalsUseCase } from './application/use-cases/trainer/list-trainer-student-physicals.use-case';
import { ListTrainerStudentEvolutionsUseCase } from './application/use-cases/trainer/list-trainer-student-evolutions.use-case';
import { SequelizeTrainingsRepository } from './infrastructure/database/trainings.repository';
import { ListTrainingsUseCase } from './application/use-cases/trainer/list-trainings.use-case';
import { GetTrainingUseCase } from './application/use-cases/trainer/get-training.use-case';
import { CreateTrainingUseCase } from './application/use-cases/trainer/create-training.use-case';
import { UpdateTrainingUseCase } from './application/use-cases/trainer/update-training.use-case';
import { DeleteTrainingUseCase } from './application/use-cases/trainer/delete-training.use-case';
import { TrainerTrainingsController } from './interfaces/http/controllers/trainer-trainings.controller';
import { TrainingsController } from './interfaces/http/controllers/trainings.controller';
import { createTrainingsRoutes } from './interfaces/http/routes/trainings.routes';
import { SequelizeExercisesRepository } from './infrastructure/database/exercises.repository';
import { ListExercisesUseCase } from './application/use-cases/trainer/list-exercises.use-case';
import { GetExerciseUseCase } from './application/use-cases/trainer/get-exercise.use-case';
import { CreateExerciseUseCase } from './application/use-cases/trainer/create-exercise.use-case';
import { UpdateExerciseUseCase } from './application/use-cases/trainer/update-exercise.use-case';
import { DeleteExerciseUseCase } from './application/use-cases/trainer/delete-exercise.use-case';
import { TrainerExercisesController } from './interfaces/http/controllers/trainer-exercises.controller';
import { ExercisesController } from './interfaces/http/controllers/exercises.controller';
import { createExercisesRoutes } from './interfaces/http/routes/exercises.routes';
import { SequelizeSetsRepository } from './infrastructure/database/sets.repository';
import { ListSetsUseCase } from './application/use-cases/trainer/list-sets.use-case';
import { GetSetUseCase } from './application/use-cases/trainer/get-set.use-case';
import { CreateSetUseCase } from './application/use-cases/trainer/create-set.use-case';
import { UpdateSetUseCase } from './application/use-cases/trainer/update-set.use-case';
import { DeleteSetUseCase } from './application/use-cases/trainer/delete-set.use-case';
import { TrainerSetsController } from './interfaces/http/controllers/trainer-sets.controller';
import { SequelizeSetsToTrainingsRepository } from './infrastructure/database/sets-to-trainings.repository';
import { ListSetsToTrainingsUseCase } from './application/use-cases/sets-to-trainings/list-sets-to-trainings.use-case';
import { GetSetToTrainingUseCase } from './application/use-cases/sets-to-trainings/get-set-to-training.use-case';
import { CreateSetToTrainingUseCase } from './application/use-cases/trainer/create-set-to-training.use-case';
import { UpdateSetToTrainingUseCase } from './application/use-cases/trainer/update-set-to-training.use-case';
import { DeleteSetToTrainingUseCase } from './application/use-cases/trainer/delete-set-to-training.use-case';
import { SetsController } from './interfaces/http/controllers/sets.controller';
import { createSetsRoutes } from './interfaces/http/routes/sets.routes';
import { SetsToTrainingsController } from './interfaces/http/controllers/sets-to-trainings.controller';
import { createSetsToTrainingsRoutes } from './interfaces/http/routes/sets-to-trainings.routes';
import { SequelizeExercisesToProgramsRepository } from './infrastructure/database/exercises-to-programs.repository';
import { ListExercisesToProgramsUseCase } from './application/use-cases/exercises-to-programs/list-exercises-to-programs.use-case';
import { GetExerciseToProgramUseCase } from './application/use-cases/exercises-to-programs/get-exercise-to-program.use-case';
import { CreateExerciseToProgramUseCase } from './application/use-cases/trainer/create-exercise-to-program.use-case';
import { UpdateExerciseToProgramUseCase } from './application/use-cases/trainer/update-exercise-to-program.use-case';
import { DeleteExerciseToProgramUseCase } from './application/use-cases/trainer/delete-exercise-to-program.use-case';
import { ExercisesToProgramsController } from './interfaces/http/controllers/exercises-to-programs.controller';
import { createExercisesToProgramsRoutes } from './interfaces/http/routes/exercises-to-programs.routes';
import { SequelizeExercisesToTrainingsRepository } from './infrastructure/database/exercises-to-trainings.repository';
import { ListExercisesToTrainingsUseCase } from './application/use-cases/exercises-to-trainings/list-exercises-to-trainings.use-case';
import { GetExerciseToTrainingUseCase } from './application/use-cases/exercises-to-trainings/get-exercise-to-training.use-case';
import { CreateExerciseToTrainingUseCase } from './application/use-cases/trainer/create-exercise-to-training.use-case';
import { UpdateExerciseToTrainingUseCase } from './application/use-cases/trainer/update-exercise-to-training.use-case';
import { DeleteExerciseToTrainingUseCase } from './application/use-cases/trainer/delete-exercise-to-training.use-case';
import { ExercisesToTrainingsController } from './interfaces/http/controllers/exercises-to-trainings.controller';
import { createExercisesToTrainingsRoutes } from './interfaces/http/routes/exercises-to-trainings.routes';
import { SequelizeSetsToStudentsRepository } from './infrastructure/database/sets-to-students.repository';
import { ListSetsToStudentsUseCase } from './application/use-cases/sets-to-students/list-sets-to-students.use-case';
import { GetSetToStudentUseCase } from './application/use-cases/sets-to-students/get-set-to-student.use-case';
import { CreateSetToStudentUseCase } from './application/use-cases/trainer/create-set-to-student.use-case';
import { UpdateSetToStudentUseCase } from './application/use-cases/trainer/update-set-to-student.use-case';
import { DeleteSetToStudentUseCase } from './application/use-cases/trainer/delete-set-to-student.use-case';
import { SetsToStudentsController } from './interfaces/http/controllers/sets-to-students.controller';
import { createSetsToStudentsRoutes } from './interfaces/http/routes/sets-to-students.routes';
import { SequelizeRepsToExercisesRepository } from './infrastructure/database/reps-to-exercises.repository';
import { ListRepsToExercisesUseCase } from './application/use-cases/reps-to-exercises/list-reps-to-exercises.use-case';
import { GetRepsToExerciseUseCase } from './application/use-cases/reps-to-exercises/get-reps-to-exercise.use-case';
import { CreateRepsToExerciseUseCase } from './application/use-cases/trainer/create-reps-to-exercise.use-case';
import { UpdateRepsToExerciseUseCase } from './application/use-cases/trainer/update-reps-to-exercise.use-case';
import { DeleteRepsToExerciseUseCase } from './application/use-cases/trainer/delete-reps-to-exercise.use-case';
import { RepsToExercisesController } from './interfaces/http/controllers/reps-to-exercises.controller';
import { createRepsToExercisesRoutes } from './interfaces/http/routes/reps-to-exercises.routes';
import { SequelizeObsToTrainingsRepository } from './infrastructure/database/obs-to-trainings.repository';
import { ListObsToTrainingsUseCase } from './application/use-cases/obs-to-trainings/list-obs-to-trainings.use-case';
import { GetObsToTrainingUseCase } from './application/use-cases/obs-to-trainings/get-obs-to-training.use-case';
import { CreateObsToTrainingUseCase } from './application/use-cases/trainer/create-obs-to-training.use-case';
import { UpdateObsToTrainingUseCase } from './application/use-cases/trainer/update-obs-to-training.use-case';
import { DeleteObsToTrainingUseCase } from './application/use-cases/trainer/delete-obs-to-training.use-case';
import { ObsToTrainingsController } from './interfaces/http/controllers/obs-to-trainings.controller';
import { createObsToTrainingsRoutes } from './interfaces/http/routes/obs-to-trainings.routes';
import { SequelizePointsRepository } from './infrastructure/database/points.repository';
import { SequelizePointCreatedNotifier } from './infrastructure/database/point-created.notifier';
import { ListPointsUseCase } from './application/use-cases/points/list-points.use-case';
import { GetPointUseCase } from './application/use-cases/points/get-point.use-case';
import { CreatePointUseCase } from './application/use-cases/points/create-point.use-case';
import { PointsController } from './interfaces/http/controllers/points.controller';
import { createPointsRoutes } from './interfaces/http/routes/points.routes';
import { SequelizeFeedbacksRepository } from './infrastructure/database/feedbacks.repository';
import { SequelizeStudentTrainingFeedbackNotifier } from './infrastructure/database/student-training-feedback.notifier';
import { ListFeedbacksUseCase } from './application/use-cases/feedbacks/list-feedbacks.use-case';
import { GetFeedbackUseCase } from './application/use-cases/feedbacks/get-feedback.use-case';
import { CreateFeedbackUseCase } from './application/use-cases/feedbacks/create-feedback.use-case';
import { FeedbacksController } from './interfaces/http/controllers/feedbacks.controller';
import { createFeedbacksRoutes } from './interfaces/http/routes/feedbacks.routes';
import { SequelizeNotificationsRepository } from './infrastructure/database/notifications.repository';
import { ListNotificationsUseCase } from './application/use-cases/notifications/list-notifications.use-case';
import { GetNotificationUseCase } from './application/use-cases/notifications/get-notification.use-case';
import { NotificationsController } from './interfaces/http/controllers/notifications.controller';
import { createNotificationsRoutes } from './interfaces/http/routes/notifications.routes';
import { SequelizeConversationsRepository } from './infrastructure/database/conversations.repository';
import { ConversationRealtimeHub } from './infrastructure/realtime/conversation-realtime.hub';
import { attachConversationWebSocket } from './infrastructure/realtime/attach-conversation-ws';
import { AppendConversationTurnUseCase } from './application/use-cases/conversations/append-conversation-turn.use-case';
import { ListConversationMessagesUseCase } from './application/use-cases/conversations/list-conversation-messages.use-case';
import { ConversationsController } from './interfaces/http/controllers/conversations.controller';
import { createConversationsRoutes } from './interfaces/http/routes/conversations.routes';
import { StudentPhysicalsController } from './interfaces/http/controllers/student-physicals.controller';
import { StudentEvolutionsController } from './interfaces/http/controllers/student-evolutions.controller';
import { StudentTrainingController } from './interfaces/http/controllers/student-training.controller';
import { GetTodayTrainingUseCase } from './application/use-cases/student/get-today-training.use-case';
import { GetWeeklyTrainingScheduleUseCase } from './application/use-cases/student/get-weekly-training-schedule.use-case';
import { GetMonthlyTrainingCalendarUseCase } from './application/use-cases/student/get-monthly-training-calendar.use-case';
import { createRequireStudentOrTrainer } from './interfaces/http/middleware/create-require-student-or-trainer.middleware';
import { createSocialRoutes } from './interfaces/http/routes/social.routes';
import { SequelizeSocialFeedRepository } from './infrastructure/database/social-feed.repository';
import { SequelizeFeedNotificationPublisher } from './infrastructure/database/feed-notifications.publisher';
import { SocialFeedController } from './interfaces/http/controllers/social-feed.controller';
import { CreatePostUseCase } from './application/use-cases/social/create-post.use-case';
import { UpdatePostUseCase } from './application/use-cases/social/update-post.use-case';
import { DeletePostUseCase } from './application/use-cases/social/delete-post.use-case';
import { CreateCommentUseCase } from './application/use-cases/social/create-comment.use-case';
import { UpdateCommentUseCase } from './application/use-cases/social/update-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/social/delete-comment.use-case';
import { LikePostUseCase } from './application/use-cases/social/like-post.use-case';
import { UnlikePostUseCase } from './application/use-cases/social/unlike-post.use-case';
import { ListPostCommentsUseCase } from './application/use-cases/social/list-post-comments.use-case';
import { ListPostLikesUseCase } from './application/use-cases/social/list-post-likes.use-case';
import { ListPostsUseCase } from './application/use-cases/social/list-posts.use-case';
import { SequelizeProgramsRepository } from './infrastructure/database/programs.repository';
import { ListProgramsUseCase } from './application/use-cases/program/list-programs.use-case';
import { ListMatchedProgramsForStudentUseCase } from './application/use-cases/program/list-matched-programs-for-student.use-case';
import { GetProgramMatchForStudentUseCase } from './application/use-cases/program/get-program-match-for-student.use-case';
import { GetProgramUseCase } from './application/use-cases/program/get-program.use-case';
import { CreateProgramUseCase } from './application/use-cases/trainer/create-program.use-case';
import { UpdateProgramUseCase } from './application/use-cases/trainer/update-program.use-case';
import { DeleteProgramUseCase } from './application/use-cases/trainer/delete-program.use-case';
import { ProgramsController } from './interfaces/http/controllers/programs.controller';
import { createProgramsRoutes } from './interfaces/http/routes/programs.routes';
import { SequelizeTrainingsToProgramsRepository } from './infrastructure/database/trainings-to-programs.repository';
import { ListTrainingsToProgramsUseCase } from './application/use-cases/trainings-to-programs/list-trainings-to-programs.use-case';
import { CreateTrainingToProgramUseCase } from './application/use-cases/trainer/create-training-to-program.use-case';
import { TrainingsToProgramsController } from './interfaces/http/controllers/trainings-to-programs.controller';
import { createTrainingsToProgramsRoutes } from './interfaces/http/routes/trainings-to-programs.routes';
import { SequelizeProgramsToStudentsRepository } from './infrastructure/database/programs-to-students.repository';
import { ListProgramsToStudentsUseCase } from './application/use-cases/programs-to-students/list-programs-to-students.use-case';
import { CreateProgramToStudentUseCase } from './application/use-cases/student/create-program-to-student.use-case';
import { LeaveProgramToStudentUseCase } from './application/use-cases/student/leave-program-to-student.use-case';
import { ProgramsToStudentsController } from './interfaces/http/controllers/programs-to-students.controller';
import { createProgramsToStudentsRoutes } from './interfaces/http/routes/programs-to-students.routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

function createObjectStorage(): IObjectStorage | null {
  const bucket = process.env.S3_BUCKET?.trim();
  if (!bucket) return null;
  const region =
    process.env.S3_REGION?.trim() || process.env.AWS_REGION?.trim() || 'sa-east-1';
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
  return new S3ObjectStorageAdapter({ bucket, region, publicBaseUrl });
}

const objectStorage = createObjectStorage();
const uploadImageFilesUseCase = new UploadImageFilesUseCase(objectStorage);
const profileImageUploadMiddleware = createImageUploadMiddleware(['photo_perfil']);
const postImageUploadMiddleware = createImageUploadMiddleware(['image']);
const programImageUploadMiddleware = createImageUploadMiddleware(['photo']);
const evolutionImageUploadMiddleware = createImageUploadMiddleware([
  'original_photo',
  'current_photo',
]);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Cache-Control, Pragma'
  );

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authProvider = new CognitoAuthAdapter();
const userProfileWriter = new SequelizeUserProfileWriter({
  Trainer: models.Trainer,
  Student: models.Student,
});
const newStudentRegistrationNotifier = new SequelizeNewStudentRegistrationNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
});
const registerUserProfileUseCase = new RegisterUserProfileUseCase(
  authProvider,
  userProfileWriter,
  newStudentRegistrationNotifier
);
const loginRefreshTokenWriter = new SequelizeLoginRefreshTokenWriter({
  Trainer: models.Trainer,
  Student: models.Student,
});
const accessTokenVerifier = new CognitoAccessTokenVerifier();
const requireAuth = createRequireAuth((token) => accessTokenVerifier.verify(token));
const userMeReader = new SequelizeUserMeReader({
  Trainer: models.Trainer,
  Student: models.Student,
});
const userProfileUpdater = new SequelizeUserProfileUpdater({
  Trainer: models.Trainer,
  Student: models.Student,
});
const authUserAttributesUpdater = new CognitoUserAttributesUpdater();
const meController = new MeController(
  new GetMeUseCase(userMeReader),
  new UpdateMyProfileUseCase(userMeReader, userProfileUpdater, authUserAttributesUpdater),
  uploadImageFilesUseCase
);
const resolveGoogleAuthUseCase = new ResolveGoogleAuthUseCase(
  userMeReader,
  userProfileWriter,
  newStudentRegistrationNotifier,
  loginRefreshTokenWriter
);
const authController = new AuthController(
  registerUserProfileUseCase,
  new ConfirmSignUpUseCase(authProvider),
  new SignInWithRefreshPersistenceUseCase(authProvider, loginRefreshTokenWriter),
  new RefreshSessionUseCase(authProvider),
  new ForgotPasswordUseCase(authProvider),
  new ResetPasswordUseCase(authProvider),
  new ResendSignUpConfirmationUseCase(authProvider),
  resolveGoogleAuthUseCase
);

app.use(
  '/auth',
  createAuthRoutes(authController, meController, requireAuth, profileImageUploadMiddleware)
);

const requireStudentOrTrainer = createRequireStudentOrTrainer(async (sub) => {
  const student = await models.Student.findByPk(sub);
  if (student) return 'student';
  const trainer = await models.Trainer.findByPk(sub);
  if (trainer) return 'trainer';
  return null;
});
const socialFeedRepository = new SequelizeSocialFeedRepository({
  Post: models.Post,
  Comment: models.Comment,
  Like: models.Like,
  Student: models.Student,
  Trainer: models.Trainer,
});
const feedNotificationPublisher = new SequelizeFeedNotificationPublisher({
  Notification: models.Notification,
  Student: models.Student,
  Trainer: models.Trainer,
});
const socialFeedController = new SocialFeedController(
  new ListPostsUseCase(socialFeedRepository),
  new CreatePostUseCase(socialFeedRepository, feedNotificationPublisher),
  new UpdatePostUseCase(socialFeedRepository),
  new DeletePostUseCase(socialFeedRepository),
  new CreateCommentUseCase(socialFeedRepository, feedNotificationPublisher),
  new UpdateCommentUseCase(socialFeedRepository),
  new DeleteCommentUseCase(socialFeedRepository),
  new LikePostUseCase(socialFeedRepository, feedNotificationPublisher),
  new UnlikePostUseCase(socialFeedRepository),
  new ListPostCommentsUseCase(socialFeedRepository),
  new ListPostLikesUseCase(socialFeedRepository),
  uploadImageFilesUseCase
);
app.use(
  '/posts',
  createSocialRoutes(
    socialFeedController,
    requireAuth,
    requireStudentOrTrainer,
    postImageUploadMiddleware
  )
);

const programsRepository = new SequelizeProgramsRepository({
  Program: models.Program,
});
const studentAnamnesisRepository = new SequelizeStudentAnamnesisRepository({
  Anamnesis: models.Anamnesis,
  Student: models.Student,
});
const trainingsToProgramsRepository = new SequelizeTrainingsToProgramsRepository({
  TrainingsToPrograms: models.TrainingsToPrograms,
  Program: models.Program,
  Training: models.Training,
});
const listTrainingsToProgramsUseCase = new ListTrainingsToProgramsUseCase(
  trainingsToProgramsRepository
);
const programsToStudentsRepository = new SequelizeProgramsToStudentsRepository({
  ProgramsToStudents: models.ProgramsToStudents,
  Student: models.Student,
  Program: models.Program,
});
const listProgramsToStudentsUseCase = new ListProgramsToStudentsUseCase(
  programsToStudentsRepository
);
const programsController = new ProgramsController(
  new ListProgramsUseCase(programsRepository),
  new GetProgramUseCase(programsRepository),
  new CreateProgramUseCase(programsRepository),
  new UpdateProgramUseCase(programsRepository),
  new DeleteProgramUseCase(programsRepository),
  listTrainingsToProgramsUseCase,
  listProgramsToStudentsUseCase,
  new ListMatchedProgramsForStudentUseCase(programsRepository, studentAnamnesisRepository),
  new GetProgramMatchForStudentUseCase(programsRepository, studentAnamnesisRepository),
  uploadImageFilesUseCase
);

const trainerStudentsRepository = new SequelizeTrainerStudentsRepository({
  Student: models.Student,
});
const requireTrainer = createRequireTrainer((sub) =>
  models.Trainer.findByPk(sub).then((row) => row !== null)
);

app.use(
  '/programs',
  createProgramsRoutes(
    programsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    programImageUploadMiddleware
  )
);

const trainingsToProgramsController = new TrainingsToProgramsController(
  listTrainingsToProgramsUseCase,
  new CreateTrainingToProgramUseCase(trainingsToProgramsRepository)
);
app.use(
  '/trainings-to-programs',
  createTrainingsToProgramsRoutes(
    trainingsToProgramsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const exercisesToProgramsRepository = new SequelizeExercisesToProgramsRepository({
  ExercisesToPrograms: models.ExercisesToPrograms,
  Program: models.Program,
  Exercise: models.Exercise,
});
const exercisesToProgramsController = new ExercisesToProgramsController(
  new ListExercisesToProgramsUseCase(exercisesToProgramsRepository),
  new GetExerciseToProgramUseCase(exercisesToProgramsRepository),
  new CreateExerciseToProgramUseCase(exercisesToProgramsRepository),
  new UpdateExerciseToProgramUseCase(exercisesToProgramsRepository),
  new DeleteExerciseToProgramUseCase(exercisesToProgramsRepository)
);
app.use(
  '/exercises-to-programs',
  createExercisesToProgramsRoutes(
    exercisesToProgramsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const exercisesToTrainingsRepository = new SequelizeExercisesToTrainingsRepository({
  ExercisesToTrainings: models.ExercisesToTrainings,
  Training: models.Training,
  Exercise: models.Exercise,
});
const exercisesToTrainingsController = new ExercisesToTrainingsController(
  new ListExercisesToTrainingsUseCase(exercisesToTrainingsRepository),
  new GetExerciseToTrainingUseCase(exercisesToTrainingsRepository),
  new CreateExerciseToTrainingUseCase(exercisesToTrainingsRepository),
  new UpdateExerciseToTrainingUseCase(exercisesToTrainingsRepository),
  new DeleteExerciseToTrainingUseCase(exercisesToTrainingsRepository)
);
app.use(
  '/exercises-to-trainings',
  createExercisesToTrainingsRoutes(
    exercisesToTrainingsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const setsToStudentsRepository = new SequelizeSetsToStudentsRepository({
  SetsToStudents: models.SetsToStudents,
  Student: models.Student,
  Set: models.Set,
});
const setsToStudentsController = new SetsToStudentsController(
  new ListSetsToStudentsUseCase(setsToStudentsRepository),
  new GetSetToStudentUseCase(setsToStudentsRepository),
  new CreateSetToStudentUseCase(setsToStudentsRepository),
  new UpdateSetToStudentUseCase(setsToStudentsRepository),
  new DeleteSetToStudentUseCase(setsToStudentsRepository)
);
app.use(
  '/sets-to-students',
  createSetsToStudentsRoutes(
    setsToStudentsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const repsToExercisesRepository = new SequelizeRepsToExercisesRepository({
  RepsToExercises: models.RepsToExercises,
  Student: models.Student,
});
const repsToExercisesController = new RepsToExercisesController(
  new ListRepsToExercisesUseCase(repsToExercisesRepository),
  new GetRepsToExerciseUseCase(repsToExercisesRepository),
  new CreateRepsToExerciseUseCase(repsToExercisesRepository),
  new UpdateRepsToExerciseUseCase(repsToExercisesRepository),
  new DeleteRepsToExerciseUseCase(repsToExercisesRepository)
);
app.use(
  '/reps-to-exercises',
  createRepsToExercisesRoutes(
    repsToExercisesController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const obsToTrainingsRepository = new SequelizeObsToTrainingsRepository({
  ObsToTrainings: models.ObsToTrainings,
  Student: models.Student,
});
const obsToTrainingsController = new ObsToTrainingsController(
  new ListObsToTrainingsUseCase(obsToTrainingsRepository),
  new GetObsToTrainingUseCase(obsToTrainingsRepository),
  new CreateObsToTrainingUseCase(obsToTrainingsRepository),
  new UpdateObsToTrainingUseCase(obsToTrainingsRepository),
  new DeleteObsToTrainingUseCase(obsToTrainingsRepository)
);
app.use(
  '/obs-to-trainings',
  createObsToTrainingsRoutes(
    obsToTrainingsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const studentPhysicalsRepository = new SequelizeStudentPhysicalsRepository({
  Physical: models.Physical,
  Student: models.Student,
});

const deleteTrainerStudentAnamnesisUseCase = new DeleteTrainerStudentAnamnesisUseCase(
  studentAnamnesisRepository
);
const studentEvolutionsRepository = new SequelizeStudentEvolutionsRepository({
  Evolution: models.Evolution,
  Student: models.Student,
});
const listTrainerStudentPhysicalsUseCase = new ListTrainerStudentPhysicalsUseCase(
  studentPhysicalsRepository
);
const listTrainerStudentEvolutionsUseCase = new ListTrainerStudentEvolutionsUseCase(
  studentEvolutionsRepository
);
const trainingsRepository = new SequelizeTrainingsRepository({
  Training: models.Training,
});
const trainerTrainingsController = new TrainerTrainingsController(
  new ListTrainingsUseCase(trainingsRepository),
  new GetTrainingUseCase(trainingsRepository),
  new CreateTrainingUseCase(trainingsRepository),
  new UpdateTrainingUseCase(trainingsRepository),
  new DeleteTrainingUseCase(trainingsRepository)
);
const trainingsController = new TrainingsController(new GetTrainingUseCase(trainingsRepository));
app.use(
  '/trainings',
  createTrainingsRoutes(trainingsController, requireAuth, requireStudentOrTrainer)
);
const exercisesRepository = new SequelizeExercisesRepository({
  Exercise: models.Exercise,
});
const trainerExercisesController = new TrainerExercisesController(
  new ListExercisesUseCase(exercisesRepository),
  new GetExerciseUseCase(exercisesRepository),
  new CreateExerciseUseCase(exercisesRepository),
  new UpdateExerciseUseCase(exercisesRepository),
  new DeleteExerciseUseCase(exercisesRepository)
);
const exercisesController = new ExercisesController(new GetExerciseUseCase(exercisesRepository));
app.use(
  '/exercises',
  createExercisesRoutes(exercisesController, requireAuth, requireStudentOrTrainer)
);
const setsRepository = new SequelizeSetsRepository({ Set: models.Set });
const trainerSetsController = new TrainerSetsController(
  new ListSetsUseCase(setsRepository),
  new GetSetUseCase(setsRepository),
  new CreateSetUseCase(setsRepository),
  new UpdateSetUseCase(setsRepository),
  new DeleteSetUseCase(setsRepository)
);
const setsToTrainingsRepository = new SequelizeSetsToTrainingsRepository({
  SetsToTrainings: models.SetsToTrainings,
  Training: models.Training,
  Set: models.Set,
});
const setsToTrainingsController = new SetsToTrainingsController(
  new ListSetsToTrainingsUseCase(setsToTrainingsRepository),
  new GetSetToTrainingUseCase(setsToTrainingsRepository),
  new CreateSetToTrainingUseCase(setsToTrainingsRepository),
  new UpdateSetToTrainingUseCase(setsToTrainingsRepository),
  new DeleteSetToTrainingUseCase(setsToTrainingsRepository)
);
const setsController = new SetsController(new GetSetUseCase(setsRepository));
app.use('/sets', createSetsRoutes(setsController, requireAuth, requireStudentOrTrainer));
app.use(
  '/sets-to-trainings',
  createSetsToTrainingsRoutes(
    setsToTrainingsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);
const trainerStudentsController = new TrainerStudentsController(
  new ListTrainerStudentsUseCase(trainerStudentsRepository),
  new SearchTrainerStudentsUseCase(trainerStudentsRepository),
  new GetTrainerStudentUseCase(trainerStudentsRepository),
  new UpdateTrainerStudentUseCase(trainerStudentsRepository),
  deleteTrainerStudentAnamnesisUseCase,
  listTrainerStudentPhysicalsUseCase,
  listTrainerStudentEvolutionsUseCase,
  new ListTrainerStudentsAnamnesesUseCase(studentAnamnesisRepository),
  new GetTrainerStudentAnamnesisUseCase(studentAnamnesisRepository)
);
app.use(
  '/trainer',
  createTrainerRoutes(
    trainerStudentsController,
    trainerTrainingsController,
    trainerExercisesController,
    trainerSetsController,
    setsToTrainingsController,
    requireAuth,
    requireTrainer
  )
);

const requireStudent = createRequireStudent((sub) =>
  models.Student.findByPk(sub).then((row) => row !== null)
);
const programsToStudentsController = new ProgramsToStudentsController(
  listProgramsToStudentsUseCase,
  new CreateProgramToStudentUseCase(programsToStudentsRepository),
  new LeaveProgramToStudentUseCase(programsToStudentsRepository)
);
app.use(
  '/programs-to-students',
  createProgramsToStudentsRoutes(
    programsToStudentsController,
    requireAuth,
    requireStudentOrTrainer,
    requireStudent
  )
);
const studentAnamnesisController = new StudentAnamnesisController(
  new CreateMyAnamnesisUseCase(studentAnamnesisRepository),
  new UpdateMyAnamnesisUseCase(studentAnamnesisRepository),
  new GetMyAnamnesisUseCase(studentAnamnesisRepository),
  new ListMyAnamnesisHistoryUseCase(studentAnamnesisRepository)
);
const anamnesisExclusiveRepository = new SequelizeAnamnesisExclusiveRepository({
  AnamnesisExclusive: models.AnamnesisExclusive,
  Student: models.Student,
});
const uploadAnamnesisExclusiveFilesUseCase = new UploadAnamnesisExclusiveFilesUseCase(objectStorage);
const anamnesisExclusiveUploadMiddleware = createAnamnesisExclusiveUploadMiddleware();
const anamnesisExclusiveController = new AnamnesisExclusiveController(
  new CreateMyAnamnesisExclusiveUseCase(anamnesisExclusiveRepository, studentPhysicalsRepository),
  uploadAnamnesisExclusiveFilesUseCase,
  new GetAnamnesisExclusiveByStudentIdUseCase(anamnesisExclusiveRepository),
  new GetAnamnesisExclusiveCompletionUseCase(anamnesisExclusiveRepository)
);
app.use(
  '/anamnesis-exclusive',
  createAnamnesisExclusiveRoutes(
    anamnesisExclusiveController,
    requireAuth,
    requireStudentOrTrainer
  )
);
const studentPhysicalsController = new StudentPhysicalsController(
  new ListMyPhysicalsUseCase(studentPhysicalsRepository),
  new GetMyPhysicalUseCase(studentPhysicalsRepository),
  new CreateMyPhysicalUseCase(studentPhysicalsRepository),
  new UpdateMyPhysicalUseCase(studentPhysicalsRepository)
);
const studentEvolutionsController = new StudentEvolutionsController(
  new ListMyEvolutionsUseCase(studentEvolutionsRepository),
  new GetMyEvolutionUseCase(studentEvolutionsRepository),
  new CreateMyEvolutionUseCase(studentEvolutionsRepository),
  new UpdateMyEvolutionUseCase(studentEvolutionsRepository),
  uploadImageFilesUseCase
);
const pointsRepository = new SequelizePointsRepository({
  Point: models.Point,
  Student: models.Student,
});
const studentTrainingController = new StudentTrainingController(
  new GetTodayTrainingUseCase(setsToStudentsRepository, trainingsRepository),
  new GetWeeklyTrainingScheduleUseCase(
    setsToStudentsRepository,
    trainingsRepository,
    pointsRepository
  ),
  new GetMonthlyTrainingCalendarUseCase(pointsRepository)
);
app.use(
  '/student',
  createStudentRoutes(
    studentAnamnesisController,
    anamnesisExclusiveController,
    studentPhysicalsController,
    studentEvolutionsController,
    studentTrainingController,
    requireAuth,
    requireStudent,
    anamnesisExclusiveUploadMiddleware,
    evolutionImageUploadMiddleware
  )
);

const pointCreatedNotifier = new SequelizePointCreatedNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
});
const pointsController = new PointsController(
  new ListPointsUseCase(pointsRepository),
  new GetPointUseCase(pointsRepository),
  new CreatePointUseCase(pointsRepository, pointCreatedNotifier)
);
app.use(
  '/points',
  createPointsRoutes(pointsController, requireAuth, requireStudentOrTrainer, requireStudent)
);

const feedbacksRepository = new SequelizeFeedbacksRepository({
  Feedback: models.Feedback,
  Student: models.Student,
});
const studentTrainingFeedbackNotifier = new SequelizeStudentTrainingFeedbackNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
});
const feedbacksController = new FeedbacksController(
  new ListFeedbacksUseCase(feedbacksRepository),
  new GetFeedbackUseCase(feedbacksRepository),
  new CreateFeedbackUseCase(feedbacksRepository, studentTrainingFeedbackNotifier)
);
app.use(
  '/feedbacks',
  createFeedbacksRoutes(feedbacksController, requireAuth, requireStudentOrTrainer, requireStudent)
);

const notificationsRepository = new SequelizeNotificationsRepository({
  Notification: models.Notification,
});
const notificationsController = new NotificationsController(
  new ListNotificationsUseCase(notificationsRepository),
  new GetNotificationUseCase(notificationsRepository)
);
app.use(
  '/notifications',
  createNotificationsRoutes(notificationsController, requireAuth, requireStudentOrTrainer)
);

const conversationsRepository = new SequelizeConversationsRepository({
  Conversation: models.Conversation,
  Student: models.Student,
});
const conversationRealtimeHub = new ConversationRealtimeHub();
const appendConversationTurnUseCase = new AppendConversationTurnUseCase(
  conversationsRepository,
  conversationRealtimeHub
);
const listConversationMessagesUseCase = new ListConversationMessagesUseCase(
  conversationsRepository
);
const conversationsController = new ConversationsController(listConversationMessagesUseCase);
app.use(
  '/conversations',
  createConversationsRoutes(conversationsController, requireAuth, requireStudentOrTrainer)
);

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

const server = http.createServer(app);

const FORBIDDEN_EXCEPTION = 'ForbiddenException';
attachConversationWebSocket({
  httpServer: server,
  wsPathname: '/ws/conversations',
  verifyAccessToken: (token: string) => accessTokenVerifier.verify(token),
  resolveParticipant: async (cognitoSub) => {
    const student = await models.Student.findByPk(cognitoSub);
    if (student) return { role: 'student', sub: cognitoSub };
    const trainer = await models.Trainer.findByPk(cognitoSub);
    if (trainer) return { role: 'trainer', sub: cognitoSub };
    return null;
  },
  authorizeRoom: async (viewer, roomStudentId) => {
    if (viewer.role === 'student' && roomStudentId !== viewer.sub) {
      const err = new Error('Você só pode acessar a própria conversa.');
      err.name = FORBIDDEN_EXCEPTION;
      throw err;
    }
    if (viewer.role === 'trainer') {
      const tid = await conversationsRepository.getTrainerIdForStudent(roomStudentId);
      if (tid !== viewer.sub) {
        const err = new Error('Esta conversa não é com uma aluna sua.');
        err.name = FORBIDDEN_EXCEPTION;
        throw err;
      }
    }
  },
  appendTurn: appendConversationTurnUseCase,
  hub: conversationRealtimeHub,
});

server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
