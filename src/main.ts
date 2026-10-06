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
import { models, sequelize } from './infrastructure/database';
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
import { ChangePasswordUseCase } from './application/use-cases/auth/change-password.use-case';
import { GetMeUseCase } from './application/use-cases/auth/get-me.use-case';
import { UpdateMyProfileUseCase } from './application/use-cases/auth/update-my-profile.use-case';
import { swaggerDocument } from './swagger';
import { createTrainerRoutes } from './interfaces/http/routes/trainer.routes';
import { createStudentSharedRoutes } from './interfaces/http/routes/student-shared.routes';
import { createSemesterPromotionRoutes } from './interfaces/http/routes/semester-promotion.routes';
import { createAppVersionRoutes } from './interfaces/http/routes/app-version.routes';
import { createEduzzWebhookRoutes } from './interfaces/http/routes/eduzz-webhook.routes';
import { createRequireTrainer } from './interfaces/http/middleware/create-require-trainer.middleware';
import { DeleteStudentAccountUseCase } from './application/use-cases/student/delete-student-account.use-case';
import { StudentAccountController } from './interfaces/http/controllers/student-account.controller';
import { SequelizeStudentAccountRepository } from './infrastructure/database/student-account.repository';
import { createStudentRoutes } from './interfaces/http/routes/student.routes';
import { createRequireStudent } from './interfaces/http/middleware/create-require-student.middleware';
import { SequelizeTrainerStudentsRepository } from './infrastructure/database/trainer-students.repository';
import { ListTrainerStudentsUseCase } from './application/use-cases/trainer/list-trainer-students.use-case';
import { SearchTrainerStudentsUseCase } from './application/use-cases/trainer/search-trainer-students.use-case';
import { GetTrainerStudentsValidationSummaryUseCase } from './application/use-cases/trainer/get-trainer-students-validation-summary.use-case';
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
import { GetTrainerAnamnesisExclusiveCountUseCase } from './application/use-cases/trainer/get-trainer-anamnesis-exclusive-count.use-case';
import { UploadAnamnesisExclusiveFilesUseCase } from './application/use-cases/anamnesis-exclusive/upload-anamnesis-exclusive-files.use-case';
import { UploadImageFilesUseCase } from './application/use-cases/media/upload-image-files.use-case';
import { AnamnesisExclusiveController } from './interfaces/http/controllers/anamnesis-exclusive.controller';
import { createAnamnesisExclusiveRoutes } from './interfaces/http/routes/anamnesis-exclusive.routes';
import { createAnamnesisExclusiveUploadMiddleware } from './interfaces/http/middleware/anamnesis-exclusive-upload.middleware';
import { createImageUploadMiddleware } from './interfaces/http/middleware/create-image-upload.middleware';
import { INTRODUCTION_CONTENT_UPLOAD_MAX_BYTES } from './application/media/image-upload.config';
import type { IObjectStorage } from './application/ports/object-storage.port';
import { S3ObjectStorageAdapter } from './infrastructure/storage/s3-object-storage.adapter';
import { SequelizeStudentPhysicalsRepository } from './infrastructure/database/student-physicals.repository';
import { SequelizeStudentEvolutionsRepository } from './infrastructure/database/student-evolutions.repository';
import { SequelizeRevaluationsRepository } from './infrastructure/database/revaluations.repository';
import { SequelizeRevaluationNotifier } from './infrastructure/database/revaluation.notifier';
import { ListMyPhysicalsUseCase } from './application/use-cases/student/list-my-physicals.use-case';
import { GetMyPhysicalUseCase } from './application/use-cases/student/get-my-physical.use-case';
import { CreateMyPhysicalUseCase } from './application/use-cases/student/create-my-physical.use-case';
import { UpdateMyPhysicalUseCase } from './application/use-cases/student/update-my-physical.use-case';
import { ListMyEvolutionsUseCase } from './application/use-cases/student/list-my-evolutions.use-case';
import { GetMyEvolutionUseCase } from './application/use-cases/student/get-my-evolution.use-case';
import { CreateMyEvolutionUseCase } from './application/use-cases/student/create-my-evolution.use-case';
import { CreateMyRevaluationUseCase } from './application/use-cases/student/create-my-revaluation.use-case';
import { UpdateMyEvolutionUseCase } from './application/use-cases/student/update-my-evolution.use-case';
import { ListTrainerPendingRevaluationInspectionsUseCase } from './application/use-cases/trainer/list-trainer-pending-revaluation-inspections.use-case';
import { GetTrainerUnrespondedFeedbacksSummaryUseCase } from './application/use-cases/trainer/get-trainer-unresponded-feedbacks-summary.use-case';
import { ListTrainerPastValidityStudentsUseCase } from './application/use-cases/trainer/list-trainer-past-validity-students.use-case';
import { SendSetValidityRemindersUseCase } from './application/use-cases/sets-to-students/send-set-validity-reminders.use-case';
import { SequelizeSetValidityNotifier } from './infrastructure/database/set-validity.notifier';
import { SendTrainerPendingRevaluationInspectionRemindersUseCase } from './application/use-cases/revaluations/send-trainer-pending-revaluation-inspection-reminders.use-case';
import { GetMyRevaluationStatusUseCase } from './application/use-cases/student/get-my-revaluation-status.use-case';
import { ListTrainerStudentRevaluationsUseCase } from './application/use-cases/trainer/list-trainer-student-revaluations.use-case';
import { GetTrainerStudentRevaluationUseCase } from './application/use-cases/trainer/get-trainer-student-revaluation.use-case';
import { CompareTrainerStudentRevaluationsUseCase } from './application/use-cases/trainer/compare-trainer-student-revaluations.use-case';
import { StartTrainerStudentsRevaluationUseCase } from './application/use-cases/trainer/start-trainer-students-revaluation.use-case';
import { SendRevaluationDailyRemindersUseCase } from './application/use-cases/revaluations/send-revaluation-daily-reminders.use-case';
import { ListTrainerStudentPhysicalsUseCase } from './application/use-cases/trainer/list-trainer-student-physicals.use-case';
import { ListTrainerStudentEvolutionsUseCase } from './application/use-cases/trainer/list-trainer-student-evolutions.use-case';
import { ListTrainerStudentAnamnesisHistoryUseCase } from './application/use-cases/trainer/list-trainer-student-anamnesis-history.use-case';
import { GetTrainerStudentWeeklyTrainingUseCase } from './application/use-cases/trainer/get-trainer-student-weekly-training.use-case';
import { GetTrainerStudentMonthlyTrainingCalendarUseCase } from './application/use-cases/trainer/get-trainer-student-monthly-training-calendar.use-case';
import { SequelizeTrainingsRepository } from './infrastructure/database/trainings.repository';
import { ListTrainingsUseCase } from './application/use-cases/trainer/list-trainings.use-case';
import { SearchTrainingsUseCase } from './application/use-cases/trainer/search-trainings.use-case';
import { GetTrainingUseCase } from './application/use-cases/trainer/get-training.use-case';
import { CreateTrainingUseCase } from './application/use-cases/trainer/create-training.use-case';
import { UpdateTrainingUseCase } from './application/use-cases/trainer/update-training.use-case';
import { DeleteTrainingUseCase } from './application/use-cases/trainer/delete-training.use-case';
import { TrainerTrainingsController } from './interfaces/http/controllers/trainer-trainings.controller';
import { TrainingsController } from './interfaces/http/controllers/trainings.controller';
import { createTrainingsRoutes } from './interfaces/http/routes/trainings.routes';
import { SequelizeExercisesRepository } from './infrastructure/database/exercises.repository';
import { ListExercisesUseCase } from './application/use-cases/trainer/list-exercises.use-case';
import { SearchExercisesUseCase } from './application/use-cases/trainer/search-exercises.use-case';
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
import { SearchSetsUseCase } from './application/use-cases/trainer/search-sets.use-case';
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
import { CopyStudentTrainingPhasesUseCase } from './application/use-cases/trainer/copy-student-training-phases.use-case';
import { SequelizeSetAssignedNotifier } from './infrastructure/database/set-assigned.notifier';
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
import { SequelizeRepsToTrainingsRepository } from './infrastructure/database/reps-to-trainings.repository';
import { ListRepsToTrainingsUseCase } from './application/use-cases/reps-to-trainings/list-reps-to-trainings.use-case';
import { GetRepsToTrainingUseCase } from './application/use-cases/reps-to-trainings/get-reps-to-training.use-case';
import { CreateRepsToTrainingUseCase } from './application/use-cases/trainer/create-reps-to-training.use-case';
import { UpdateRepsToTrainingUseCase } from './application/use-cases/trainer/update-reps-to-training.use-case';
import { DeleteRepsToTrainingUseCase } from './application/use-cases/trainer/delete-reps-to-training.use-case';
import { RepsToTrainingsController } from './interfaces/http/controllers/reps-to-trainings.controller';
import { createRepsToTrainingsRoutes } from './interfaces/http/routes/reps-to-trainings.routes';
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
import { CreateFeedbackResponseUseCase } from './application/use-cases/feedbacks/create-feedback-response.use-case';
import {
  DeleteFeedbackResponseUseCase,
  ListFeedbackResponsesUseCase,
  UpdateFeedbackResponseUseCase,
} from './application/use-cases/feedbacks/feedback-response.use-cases';
import { SequelizeFeedbackResponsesRepository } from './infrastructure/database/feedback-responses.repository';
import { SequelizeFeedbackResponseNotifier } from './infrastructure/database/feedback-response.notifier';
import { FeedbacksController } from './interfaces/http/controllers/feedbacks.controller';
import { createFeedbacksRoutes } from './interfaces/http/routes/feedbacks.routes';
import { SequelizeCouponsRepository } from './infrastructure/database/coupons.repository';
import { SequelizeWellbeingRepository } from './infrastructure/database/wellbeing.repository';
import { SequelizeWellsRepository } from './infrastructure/database/wells.repository';
import { ListCouponsUseCase } from './application/use-cases/coupons/list-coupons.use-case';
import { GetCouponUseCase } from './application/use-cases/coupons/get-coupon.use-case';
import { CreateCouponUseCase } from './application/use-cases/coupons/create-coupon.use-case';
import { UpdateCouponUseCase } from './application/use-cases/coupons/update-coupon.use-case';
import { DeleteCouponUseCase } from './application/use-cases/coupons/delete-coupon.use-case';
import { ListNoticesUseCase } from './application/use-cases/notices/list-notices.use-case';
import { GetNoticeUseCase } from './application/use-cases/notices/get-notice.use-case';
import { CreateNoticeUseCase } from './application/use-cases/notices/create-notice.use-case';
import { DeleteNoticeUseCase } from './application/use-cases/notices/delete-notice.use-case';
import { ListWellbeingUseCase } from './application/use-cases/wellbeing/list-wellbeing.use-case';
import { GetWellbeingUseCase } from './application/use-cases/wellbeing/get-wellbeing.use-case';
import { CreateWellbeingUseCase } from './application/use-cases/wellbeing/create-wellbeing.use-case';
import { UpdateWellbeingUseCase } from './application/use-cases/wellbeing/update-wellbeing.use-case';
import { DeleteWellbeingUseCase } from './application/use-cases/wellbeing/delete-wellbeing.use-case';
import { ListWellsUseCase } from './application/use-cases/wells/list-wells.use-case';
import { GetWellUseCase } from './application/use-cases/wells/get-well.use-case';
import { CreateWellUseCase } from './application/use-cases/wells/create-well.use-case';
import { UpdateWellUseCase } from './application/use-cases/wells/update-well.use-case';
import { DeleteWellUseCase } from './application/use-cases/wells/delete-well.use-case';
import { CouponsController } from './interfaces/http/controllers/coupons.controller';
import { NoticesController } from './interfaces/http/controllers/notices.controller';
import { StudentSharedController } from './interfaces/http/controllers/student-shared.controller';
import { SemesterPromotionController } from './interfaces/http/controllers/semester-promotion.controller';
import { AppVersionController } from './interfaces/http/controllers/app-version.controller';
import { EduzzWebhookController } from './interfaces/http/controllers/eduzz-webhook.controller';
import { GetStudentWasExclusiveUseCase } from './application/use-cases/students/get-student-was-exclusive.use-case';
import {
  GetSemesterPromotionUseCase,
  UpdateSemesterPromotionUseCase,
} from './application/use-cases/trainer/semester-promotion.use-cases';
import {
  CreateAppVersionUseCase,
  GetAppVersionUseCase,
  UpdateAppVersionUseCase,
} from './application/use-cases/app-version/app-version.use-cases';
import { SequelizeTrainerSettingsRepository } from './infrastructure/database/trainer-settings.repository';
import { SequelizeAppVersionRepository } from './infrastructure/database/app-version.repository';
import { SequelizeEduzzStudentPlanRepository } from './infrastructure/database/eduzz-student-plans.repository';
import { SequelizeStudentPlanExpirationRepository } from './infrastructure/database/student-plan-expiration.repository';
import { ProcessEduzzWebhookUseCase } from './application/use-cases/eduzz/process-eduzz-webhook.use-case';
import { ExpireStudentPlansUseCase } from './application/use-cases/student-plans/expire-student-plans.use-case';
import { CognitoStudentSessionInvalidator } from './infrastructure/auth/cognito/cognito-student-session.invalidator';
import { WellbeingController } from './interfaces/http/controllers/wellbeing.controller';
import { WellsController } from './interfaces/http/controllers/wells.controller';
import { createCouponsRoutes } from './interfaces/http/routes/coupons.routes';
import { createNoticesRoutes } from './interfaces/http/routes/notices.routes';
import { createWellbeingRoutes } from './interfaces/http/routes/wellbeing.routes';
import { createWellsRoutes } from './interfaces/http/routes/wells.routes';
import { SequelizePlaylistsRepository } from './infrastructure/database/playlists.repository';
import { ListPlaylistsUseCase } from './application/use-cases/playlists/list-playlists.use-case';
import { GetPlaylistUseCase } from './application/use-cases/playlists/get-playlist.use-case';
import { CreatePlaylistUseCase } from './application/use-cases/playlists/create-playlist.use-case';
import { UpdatePlaylistUseCase } from './application/use-cases/playlists/update-playlist.use-case';
import { DeletePlaylistUseCase } from './application/use-cases/playlists/delete-playlist.use-case';
import { PlaylistsController } from './interfaces/http/controllers/playlists.controller';
import { createPlaylistsRoutes } from './interfaces/http/routes/playlists.routes';
import { SequelizeIntroductionsRepository } from './infrastructure/database/introductions.repository';
import { SequelizeContentsRepository } from './infrastructure/database/contents.repository';
import { ListIntroductionsUseCase } from './application/use-cases/introductions/list-introductions.use-case';
import { GetIntroductionUseCase } from './application/use-cases/introductions/get-introduction.use-case';
import { CreateIntroductionUseCase } from './application/use-cases/introductions/create-introduction.use-case';
import { UpdateIntroductionUseCase } from './application/use-cases/introductions/update-introduction.use-case';
import { DeleteIntroductionUseCase } from './application/use-cases/introductions/delete-introduction.use-case';
import { ListContentsUseCase } from './application/use-cases/contents/list-contents.use-case';
import { GetContentUseCase } from './application/use-cases/contents/get-content.use-case';
import { CreateContentUseCase } from './application/use-cases/contents/create-content.use-case';
import { UpdateContentUseCase } from './application/use-cases/contents/update-content.use-case';
import { DeleteContentUseCase } from './application/use-cases/contents/delete-content.use-case';
import { IntroductionsController } from './interfaces/http/controllers/introductions.controller';
import { ContentsController } from './interfaces/http/controllers/contents.controller';
import { createIntroductionsRoutes } from './interfaces/http/routes/introductions.routes';
import { createContentsRoutes } from './interfaces/http/routes/contents.routes';
import { SequelizeContentStudentsNotifier } from './infrastructure/database/content-students-notifier';
import { SequelizeNoticesRepository } from './infrastructure/database/notices.repository';
import { SequelizeNoticesNotifier } from './infrastructure/database/notices.notifier';
import { SequelizeNotificationsRepository } from './infrastructure/database/notifications.repository';
import { ListNotificationsUseCase } from './application/use-cases/notifications/list-notifications.use-case';
import { GetNotificationUseCase } from './application/use-cases/notifications/get-notification.use-case';
import { MarkNotificationReadUseCase } from './application/use-cases/notifications/mark-notification-read.use-case';
import { MarkAllNotificationsReadUseCase } from './application/use-cases/notifications/mark-all-notifications-read.use-case';
import { MarkConversationNotificationsReadUseCase } from './application/use-cases/notifications/mark-conversation-notifications-read.use-case';
import { NotificationsController } from './interfaces/http/controllers/notifications.controller';
import { createNotificationsRoutes } from './interfaces/http/routes/notifications.routes';
import { SequelizeRankingsRepository } from './infrastructure/database/rankings.repository';
import { SequelizeRankingChampionNotifier } from './infrastructure/database/ranking-champion.notifier';
import { GetCurrentMonthRankingUseCase } from './application/use-cases/rankings/get-current-month-ranking.use-case';
import { GetLastMonthRankingChampionUseCase } from './application/use-cases/rankings/get-last-month-ranking-champion.use-case';
import { SendLastMonthRankingChampionNotificationsUseCase } from './application/use-cases/rankings/send-last-month-ranking-champion-notifications.use-case';
import { RankingsController } from './interfaces/http/controllers/rankings.controller';
import { createRankingsRoutes } from './interfaces/http/routes/rankings.routes';
import { startRankingChampionNotificationScheduler } from './infrastructure/scheduling/ranking-champion-notification.scheduler';
import { startRevaluationDailyReminderScheduler } from './infrastructure/scheduling/revaluation-daily-reminder.scheduler';
import { startStudentPlanExpirationScheduler } from './infrastructure/scheduling/student-plan-expiration.scheduler';
import { SequelizeConversationsRepository } from './infrastructure/database/conversations.repository';
import { SequelizeConversationMessageNotifier } from './infrastructure/database/conversation-message.notifier';
import { ConversationRealtimeHub } from './infrastructure/realtime/conversation-realtime.hub';
import { attachConversationWebSocket } from './infrastructure/realtime/attach-conversation-ws';
import { AppendConversationTurnUseCase } from './application/use-cases/conversations/append-conversation-turn.use-case';
import { GetConversationPartnerUseCase } from './application/use-cases/conversations/get-conversation-partner.use-case';
import { ListConversationMessagesUseCase } from './application/use-cases/conversations/list-conversation-messages.use-case';
import { ConversationsController } from './interfaces/http/controllers/conversations.controller';
import { createConversationsRoutes } from './interfaces/http/routes/conversations.routes';
import { StudentPhysicalsController } from './interfaces/http/controllers/student-physicals.controller';
import { StudentEvolutionsController } from './interfaces/http/controllers/student-evolutions.controller';
import { StudentRevaluationsController } from './interfaces/http/controllers/student-revaluations.controller';
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
import { GetPostUseCase } from './application/use-cases/social/get-post.use-case';
import { SequelizeProgramsRepository } from './infrastructure/database/programs.repository';
import { ListProgramsUseCase } from './application/use-cases/program/list-programs.use-case';
import { SearchProgramsUseCase } from './application/use-cases/program/search-programs.use-case';
import { ListMatchedProgramsForStudentUseCase } from './application/use-cases/program/list-matched-programs-for-student.use-case';
import { GetProgramMatchForStudentUseCase } from './application/use-cases/program/get-program-match-for-student.use-case';
import { GetProgramUseCase } from './application/use-cases/program/get-program.use-case';
import { CreateProgramUseCase } from './application/use-cases/trainer/create-program.use-case';
import { UpdateProgramUseCase } from './application/use-cases/trainer/update-program.use-case';
import { DeleteProgramUseCase } from './application/use-cases/trainer/delete-program.use-case';
import { ProgramsController } from './interfaces/http/controllers/programs.controller';
import { createProgramsRoutes } from './interfaces/http/routes/programs.routes';
import { createMediaRoutes } from './interfaces/http/routes/media.routes';
import { MediaController } from './interfaces/http/controllers/media.controller';
import {
  GetRemoteDisplayImageUseCase,
} from './application/use-cases/media/get-remote-display-image.use-case';
import { GetRemoteMediaUseCase } from './application/use-cases/media/get-remote-media.use-case';
import { SequelizeTrainingsToProgramsRepository } from './infrastructure/database/trainings-to-programs.repository';
import { ListTrainingsToProgramsUseCase } from './application/use-cases/trainings-to-programs/list-trainings-to-programs.use-case';
import { CreateTrainingToProgramUseCase } from './application/use-cases/trainer/create-training-to-program.use-case';
import { DeleteTrainingToProgramUseCase } from './application/use-cases/trainer/delete-training-to-program.use-case';
import { TrainingsToProgramsController } from './interfaces/http/controllers/trainings-to-programs.controller';
import { createTrainingsToProgramsRoutes } from './interfaces/http/routes/trainings-to-programs.routes';
import { SequelizeProgramsToStudentsRepository } from './infrastructure/database/programs-to-students.repository';
import { ListProgramsToStudentsUseCase } from './application/use-cases/programs-to-students/list-programs-to-students.use-case';
import { CreateProgramToStudentUseCase } from './application/use-cases/student/create-program-to-student.use-case';
import { LeaveProgramToStudentUseCase } from './application/use-cases/student/leave-program-to-student.use-case';
import { ProgramsToStudentsController } from './interfaces/http/controllers/programs-to-students.controller';
import { createProgramsToStudentsRoutes } from './interfaces/http/routes/programs-to-students.routes';
import { SequelizeFoldersRepository } from './infrastructure/database/folders.repository';
import { SequelizeFoldersToTypeRepository } from './infrastructure/database/folders-to-type.repository';
import { ListFoldersUseCase } from './application/use-cases/folders/list-folders.use-case';
import { GetFolderUseCase } from './application/use-cases/folders/get-folder.use-case';
import { CreateFolderUseCase } from './application/use-cases/trainer/create-folder.use-case';
import { UpdateFolderUseCase } from './application/use-cases/trainer/update-folder.use-case';
import { DeleteFolderUseCase } from './application/use-cases/trainer/delete-folder.use-case';
import { ListFoldersToTypeUseCase } from './application/use-cases/folders-to-type/list-folders-to-type.use-case';
import { GetFolderToTypeUseCase } from './application/use-cases/folders-to-type/get-folder-to-type.use-case';
import { CreateFolderToTypeUseCase } from './application/use-cases/trainer/create-folder-to-type.use-case';
import { UpdateFolderToTypeUseCase } from './application/use-cases/trainer/update-folder-to-type.use-case';
import { DeleteFolderToTypeUseCase } from './application/use-cases/trainer/delete-folder-to-type.use-case';
import { FoldersController } from './interfaces/http/controllers/folders.controller';
import { FoldersToTypeController } from './interfaces/http/controllers/folders-to-type.controller';
import { createFoldersRoutes } from './interfaces/http/routes/folders.routes';
import { createFoldersToTypeRoutes } from './interfaces/http/routes/folders-to-type.routes';
import { SequelizeMethodsRepository } from './infrastructure/database/methods.repository';
import { ListMethodsUseCase } from './application/use-cases/methods/list-methods.use-case';
import { GetMethodUseCase } from './application/use-cases/methods/get-method.use-case';
import { CreateMethodUseCase } from './application/use-cases/trainer/create-method.use-case';
import { UpdateMethodUseCase } from './application/use-cases/trainer/update-method.use-case';
import { DeleteMethodUseCase } from './application/use-cases/trainer/delete-method.use-case';
import { MethodsController } from './interfaces/http/controllers/methods.controller';
import { createMethodsRoutes } from './interfaces/http/routes/methods.routes';
import { SequelizeMethodProgramsRepository } from './infrastructure/database/method-programs.repository';
import { GetMethodProgramUseCase } from './application/use-cases/method-programs/get-method-program.use-case';
import { UpdateMethodProgramUseCase } from './application/use-cases/trainer/update-method-program.use-case';
import { MethodProgramsController } from './interfaces/http/controllers/method-programs.controller';
import { createMethodProgramsRoutes } from './interfaces/http/routes/method-programs.routes';

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
const couponImageUploadMiddleware = createImageUploadMiddleware(['photo']);
const wellbeingImageUploadMiddleware = createImageUploadMiddleware(['photo']);
const wellImageUploadMiddleware = createImageUploadMiddleware(['photo', 'pdf']);
const playlistImageUploadMiddleware = createImageUploadMiddleware(['photo']);
const introductionContentUploadMiddleware = createImageUploadMiddleware(
  ['link'],
  INTRODUCTION_CONTENT_UPLOAD_MAX_BYTES
);
const evolutionImageUploadMiddleware = createImageUploadMiddleware([
  'original_photo',
  'current_photo',
]);
const revaluationImageUploadMiddleware = createImageUploadMiddleware([
  'front_photo',
  'side_photo',
  'back_photo',
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
  resolveGoogleAuthUseCase,
  new ChangePasswordUseCase()
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
  uploadImageFilesUseCase,
  new GetPostUseCase(socialFeedRepository)
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
const contentStudentsNotifier = new SequelizeContentStudentsNotifier({
  Notification: models.Notification,
  Student: models.Student,
});
const programsController = new ProgramsController(
  new ListProgramsUseCase(programsRepository),
  new SearchProgramsUseCase(programsRepository),
  new GetProgramUseCase(programsRepository),
  new CreateProgramUseCase(programsRepository, contentStudentsNotifier),
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
  Trainer: models.Trainer,
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

const mediaController = new MediaController(
  new GetRemoteMediaUseCase(objectStorage),
  new GetRemoteDisplayImageUseCase(objectStorage),
);
app.use(
  '/media',
  createMediaRoutes(mediaController, requireAuth, requireStudentOrTrainer)
);

const trainingsToProgramsController = new TrainingsToProgramsController(
  listTrainingsToProgramsUseCase,
  new CreateTrainingToProgramUseCase(trainingsToProgramsRepository),
  new DeleteTrainingToProgramUseCase(trainingsToProgramsRepository)
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
  Trainer: models.Trainer,
});
const feedbacksRepository = new SequelizeFeedbacksRepository({
  Feedback: models.Feedback,
  Student: models.Student,
});
const setAssignedNotifier = new SequelizeSetAssignedNotifier({
  Notification: models.Notification,
  Student: models.Student,
});
async function resolveTrainerDisplayName(trainerId: string): Promise<string> {
  const trainer = await models.Trainer.findByPk(trainerId, {
    attributes: ['full_name'],
    raw: true,
  });
  const name = trainer ? (trainer as { full_name: string }).full_name?.trim() : '';
  return name || 'Kátia';
}
const setsToStudentsController = new SetsToStudentsController(
  new ListSetsToStudentsUseCase(setsToStudentsRepository),
  new GetSetToStudentUseCase(setsToStudentsRepository),
  new CreateSetToStudentUseCase(
    setsToStudentsRepository,
    setAssignedNotifier,
    resolveTrainerDisplayName
  ),
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

const repsToTrainingsRepository = new SequelizeRepsToTrainingsRepository({
  RepsToTrainings: models.RepsToTrainings,
});
const repsToTrainingsController = new RepsToTrainingsController(
  new ListRepsToTrainingsUseCase(repsToTrainingsRepository),
  new GetRepsToTrainingUseCase(repsToTrainingsRepository),
  new CreateRepsToTrainingUseCase(repsToTrainingsRepository),
  new UpdateRepsToTrainingUseCase(repsToTrainingsRepository),
  new DeleteRepsToTrainingUseCase(repsToTrainingsRepository)
);
app.use(
  '/reps-to-trainings',
  createRepsToTrainingsRoutes(
    repsToTrainingsController,
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

const foldersRepository = new SequelizeFoldersRepository({ Folder: models.Folder });
const foldersController = new FoldersController(
  new ListFoldersUseCase(foldersRepository),
  new GetFolderUseCase(foldersRepository),
  new CreateFolderUseCase(foldersRepository),
  new UpdateFolderUseCase(foldersRepository),
  new DeleteFolderUseCase(foldersRepository)
);
app.use('/folders', createFoldersRoutes(foldersController, requireAuth, requireTrainer));

const foldersToTypeRepository = new SequelizeFoldersToTypeRepository({
  FoldersToType: models.FoldersToType,
  Folder: models.Folder,
  Training: models.Training,
  Exercise: models.Exercise,
  Set: models.Set,
});
const foldersToTypeController = new FoldersToTypeController(
  new ListFoldersToTypeUseCase(foldersToTypeRepository),
  new GetFolderToTypeUseCase(foldersToTypeRepository),
  new CreateFolderToTypeUseCase(foldersToTypeRepository, foldersRepository),
  new UpdateFolderToTypeUseCase(foldersToTypeRepository, foldersRepository),
  new DeleteFolderToTypeUseCase(foldersToTypeRepository)
);
app.use(
  '/folders-to-type',
  createFoldersToTypeRoutes(foldersToTypeController, requireAuth, requireTrainer)
);

const methodsRepository = new SequelizeMethodsRepository({
  Method: models.Method,
  MethodProgram: models.MethodProgram,
});
const methodsController = new MethodsController(
  new ListMethodsUseCase(methodsRepository),
  new GetMethodUseCase(methodsRepository),
  new CreateMethodUseCase(methodsRepository),
  new UpdateMethodUseCase(methodsRepository),
  new DeleteMethodUseCase(methodsRepository)
);
app.use(
  '/methods',
  createMethodsRoutes(
    methodsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const methodProgramsRepository = new SequelizeMethodProgramsRepository({
  MethodProgram: models.MethodProgram,
});
const methodProgramsController = new MethodProgramsController(
  new GetMethodProgramUseCase(methodProgramsRepository),
  new UpdateMethodProgramUseCase(methodProgramsRepository)
);
app.use(
  '/method-programs',
  createMethodProgramsRoutes(
    methodProgramsController,
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
const revaluationsRepository = new SequelizeRevaluationsRepository({
  Revaluation: models.Revaluation,
  Student: models.Student,
  Trainer: models.Trainer,
});
const revaluationNotifier = new SequelizeRevaluationNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
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
const pointsRepository = new SequelizePointsRepository({
  Point: models.Point,
  Student: models.Student,
});
const getWeeklyTrainingScheduleUseCase = new GetWeeklyTrainingScheduleUseCase(
  setsToStudentsRepository,
  trainingsRepository,
  pointsRepository
);
const getMonthlyTrainingCalendarUseCase = new GetMonthlyTrainingCalendarUseCase(pointsRepository);
const listTrainerStudentAnamnesisHistoryUseCase = new ListTrainerStudentAnamnesisHistoryUseCase(
  trainerStudentsRepository,
  studentAnamnesisRepository
);
const getTrainerStudentWeeklyTrainingUseCase = new GetTrainerStudentWeeklyTrainingUseCase(
  trainerStudentsRepository,
  getWeeklyTrainingScheduleUseCase
);
const getTrainerStudentMonthlyTrainingCalendarUseCase =
  new GetTrainerStudentMonthlyTrainingCalendarUseCase(
    trainerStudentsRepository,
    getMonthlyTrainingCalendarUseCase
  );
const trainerTrainingsController = new TrainerTrainingsController(
  new ListTrainingsUseCase(trainingsRepository),
  new GetTrainingUseCase(trainingsRepository),
  new CreateTrainingUseCase(trainingsRepository),
  new UpdateTrainingUseCase(trainingsRepository),
  new DeleteTrainingUseCase(trainingsRepository),
  new SearchTrainingsUseCase(trainingsRepository)
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
  new DeleteExerciseUseCase(exercisesRepository),
  new SearchExercisesUseCase(exercisesRepository)
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
  new DeleteSetUseCase(setsRepository),
  new SearchSetsUseCase(setsRepository)
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
const copyStudentTrainingPhasesUseCase = new CopyStudentTrainingPhasesUseCase(
  setsToStudentsRepository,
  exercisesToTrainingsRepository,
  repsToExercisesRepository,
  setAssignedNotifier
);
const trainerStudentsController = new TrainerStudentsController(
  new ListTrainerStudentsUseCase(trainerStudentsRepository),
  new SearchTrainerStudentsUseCase(trainerStudentsRepository),
  new GetTrainerStudentsValidationSummaryUseCase(trainerStudentsRepository),
  new GetTrainerStudentUseCase(trainerStudentsRepository),
  new UpdateTrainerStudentUseCase(trainerStudentsRepository),
  deleteTrainerStudentAnamnesisUseCase,
  listTrainerStudentPhysicalsUseCase,
  listTrainerStudentEvolutionsUseCase,
  new ListTrainerStudentsAnamnesesUseCase(studentAnamnesisRepository),
  new GetTrainerStudentAnamnesisUseCase(studentAnamnesisRepository),
  listTrainerStudentAnamnesisHistoryUseCase,
  getTrainerStudentWeeklyTrainingUseCase,
  getTrainerStudentMonthlyTrainingCalendarUseCase,
  copyStudentTrainingPhasesUseCase,
  new ListTrainerStudentRevaluationsUseCase(revaluationsRepository),
  new GetTrainerStudentRevaluationUseCase(revaluationsRepository),
  new CompareTrainerStudentRevaluationsUseCase(revaluationsRepository),
  new StartTrainerStudentsRevaluationUseCase(revaluationsRepository, revaluationNotifier),
  new ListTrainerPendingRevaluationInspectionsUseCase(revaluationsRepository),
  new GetTrainerUnrespondedFeedbacksSummaryUseCase(feedbacksRepository),
  new ListTrainerPastValidityStudentsUseCase(setsToStudentsRepository),
  resolveTrainerDisplayName
);
const trainerSettingsRepository = new SequelizeTrainerSettingsRepository({
  Trainer: models.Trainer,
  Student: models.Student,
});
const semesterPromotionController = new SemesterPromotionController(
  new GetSemesterPromotionUseCase(trainerSettingsRepository),
  new UpdateSemesterPromotionUseCase(trainerSettingsRepository)
);
app.use(
  '/trainer',
  createTrainerRoutes(
    trainerStudentsController,
    trainerTrainingsController,
    trainerExercisesController,
    trainerSetsController,
    setsToTrainingsController,
    semesterPromotionController,
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
  new GetAnamnesisExclusiveCompletionUseCase(anamnesisExclusiveRepository),
  new GetTrainerAnamnesisExclusiveCountUseCase(anamnesisExclusiveRepository)
);
app.use(
  '/anamnesis-exclusive',
  createAnamnesisExclusiveRoutes(
    anamnesisExclusiveController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
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
const studentRevaluationsController = new StudentRevaluationsController(
  new CreateMyRevaluationUseCase(revaluationsRepository, revaluationNotifier),
  new GetMyRevaluationStatusUseCase(revaluationsRepository),
  uploadImageFilesUseCase
);
const studentTrainingController = new StudentTrainingController(
  new GetTodayTrainingUseCase(setsToStudentsRepository, trainingsRepository),
  getWeeklyTrainingScheduleUseCase,
  getMonthlyTrainingCalendarUseCase
);
const studentAccountRepository = new SequelizeStudentAccountRepository(sequelize, models);
const studentAccountController = new StudentAccountController(
  new DeleteStudentAccountUseCase(studentAccountRepository)
);
app.use(
  '/student',
  createStudentRoutes(
    studentAnamnesisController,
    anamnesisExclusiveController,
    studentPhysicalsController,
    studentEvolutionsController,
    studentRevaluationsController,
    studentTrainingController,
    studentAccountController,
    requireAuth,
    requireStudent,
    anamnesisExclusiveUploadMiddleware,
    evolutionImageUploadMiddleware,
    revaluationImageUploadMiddleware
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

const feedbackResponsesRepository = new SequelizeFeedbackResponsesRepository({
  ResponsesFeedback: models.ResponsesFeedback,
});
const studentTrainingFeedbackNotifier = new SequelizeStudentTrainingFeedbackNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
});
const feedbackResponseNotifier = new SequelizeFeedbackResponseNotifier({
  Notification: models.Notification,
  Student: models.Student,
});
const feedbacksController = new FeedbacksController(
  new ListFeedbacksUseCase(feedbacksRepository, feedbackResponsesRepository),
  new GetFeedbackUseCase(feedbacksRepository, feedbackResponsesRepository),
  new CreateFeedbackUseCase(feedbacksRepository, studentTrainingFeedbackNotifier),
  new ListFeedbackResponsesUseCase(feedbacksRepository, feedbackResponsesRepository),
  new CreateFeedbackResponseUseCase(
    feedbacksRepository,
    feedbackResponsesRepository,
    feedbackResponseNotifier
  ),
  new UpdateFeedbackResponseUseCase(feedbacksRepository, feedbackResponsesRepository),
  new DeleteFeedbackResponseUseCase(feedbacksRepository, feedbackResponsesRepository)
);
app.use(
  '/feedbacks',
  createFeedbacksRoutes(
    feedbacksController,
    requireAuth,
    requireStudentOrTrainer,
    requireStudent,
    requireTrainer
  )
);

const couponsRepository = new SequelizeCouponsRepository({ Coupon: models.Coupon });
const wellbeingRepository = new SequelizeWellbeingRepository({ Wellbeing: models.Wellbeing });
const wellsRepository = new SequelizeWellsRepository({
  Well: models.Well,
  Wellbeing: models.Wellbeing,
});

const couponsController = new CouponsController(
  new ListCouponsUseCase(couponsRepository),
  new GetCouponUseCase(couponsRepository),
  new CreateCouponUseCase(couponsRepository, contentStudentsNotifier),
  new UpdateCouponUseCase(couponsRepository),
  new DeleteCouponUseCase(couponsRepository),
  uploadImageFilesUseCase
);
app.use(
  '/coupons',
  createCouponsRoutes(
    couponsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    couponImageUploadMiddleware
  )
);

const noticesRepository = new SequelizeNoticesRepository({ Notice: models.Notice });
const noticesNotifier = new SequelizeNoticesNotifier({
  Notification: models.Notification,
  Student: models.Student,
});
const noticesController = new NoticesController(
  new ListNoticesUseCase(noticesRepository),
  new GetNoticeUseCase(noticesRepository),
  new CreateNoticeUseCase(noticesRepository, noticesNotifier),
  new DeleteNoticeUseCase(noticesRepository)
);
app.use(
  '/notices',
  createNoticesRoutes(
    noticesController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const wellbeingController = new WellbeingController(
  new ListWellbeingUseCase(wellbeingRepository),
  new GetWellbeingUseCase(wellbeingRepository),
  new CreateWellbeingUseCase(wellbeingRepository, contentStudentsNotifier),
  new UpdateWellbeingUseCase(wellbeingRepository),
  new DeleteWellbeingUseCase(wellbeingRepository, wellsRepository),
  uploadImageFilesUseCase
);
app.use(
  '/wellbeing',
  createWellbeingRoutes(
    wellbeingController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    wellbeingImageUploadMiddleware
  )
);

const wellsController = new WellsController(
  new ListWellsUseCase(wellsRepository),
  new GetWellUseCase(wellsRepository, wellbeingRepository),
  new CreateWellUseCase(wellsRepository, wellbeingRepository),
  new UpdateWellUseCase(wellsRepository, wellbeingRepository),
  new DeleteWellUseCase(wellsRepository),
  uploadImageFilesUseCase
);
app.use(
  '/wells',
  createWellsRoutes(
    wellsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    wellImageUploadMiddleware
  )
);

const playlistsRepository = new SequelizePlaylistsRepository({ Playlist: models.Playlist });
const playlistsController = new PlaylistsController(
  new ListPlaylistsUseCase(playlistsRepository),
  new GetPlaylistUseCase(playlistsRepository),
  new CreatePlaylistUseCase(playlistsRepository),
  new UpdatePlaylistUseCase(playlistsRepository),
  new DeletePlaylistUseCase(playlistsRepository),
  uploadImageFilesUseCase
);
app.use(
  '/playlists',
  createPlaylistsRoutes(
    playlistsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    playlistImageUploadMiddleware
  )
);

const introductionsRepository = new SequelizeIntroductionsRepository({
  Introduction: models.Introduction,
  Program: models.Program,
});
const introductionsController = new IntroductionsController(
  new ListIntroductionsUseCase(introductionsRepository),
  new GetIntroductionUseCase(introductionsRepository, programsRepository),
  new CreateIntroductionUseCase(introductionsRepository, programsRepository),
  new UpdateIntroductionUseCase(introductionsRepository, programsRepository),
  new DeleteIntroductionUseCase(introductionsRepository)
);
app.use(
  '/introductions',
  createIntroductionsRoutes(
    introductionsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer
  )
);

const contentsRepository = new SequelizeContentsRepository({
  Content: models.Content,
  Introduction: models.Introduction,
  Program: models.Program,
});
const contentsController = new ContentsController(
  new ListContentsUseCase(contentsRepository),
  new GetContentUseCase(contentsRepository, introductionsRepository, programsRepository),
  new CreateContentUseCase(contentsRepository, introductionsRepository),
  new UpdateContentUseCase(contentsRepository, introductionsRepository),
  new DeleteContentUseCase(contentsRepository),
  uploadImageFilesUseCase
);
app.use(
  '/contents',
  createContentsRoutes(
    contentsController,
    requireAuth,
    requireStudentOrTrainer,
    requireTrainer,
    introductionContentUploadMiddleware
  )
);

const notificationsRepository = new SequelizeNotificationsRepository({
  Notification: models.Notification,
});
const rankingsRepository = new SequelizeRankingsRepository({
  Student: models.Student,
  Point: models.Point,
  Notification: models.Notification,
});
const rankingChampionNotifier = new SequelizeRankingChampionNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
  Student: models.Student,
});
const rankingsController = new RankingsController(
  new GetCurrentMonthRankingUseCase(rankingsRepository),
  new GetLastMonthRankingChampionUseCase(rankingsRepository)
);
app.use(
  '/rankings',
  createRankingsRoutes(rankingsController, requireAuth, requireStudentOrTrainer)
);

const sendLastMonthRankingChampionNotifications = new SendLastMonthRankingChampionNotificationsUseCase(
  rankingsRepository,
  rankingChampionNotifier
);
startRankingChampionNotificationScheduler(sendLastMonthRankingChampionNotifications);

const sendRevaluationDailyReminders = new SendRevaluationDailyRemindersUseCase(
  revaluationsRepository,
  revaluationNotifier
);
const sendTrainerPendingRevaluationInspectionReminders =
  new SendTrainerPendingRevaluationInspectionRemindersUseCase(
    revaluationsRepository,
    revaluationNotifier
  );
const setValidityNotifier = new SequelizeSetValidityNotifier({
  Notification: models.Notification,
  Trainer: models.Trainer,
});
const sendSetValidityReminders = new SendSetValidityRemindersUseCase(
  setsToStudentsRepository,
  setValidityNotifier
);
startRevaluationDailyReminderScheduler(
  sendRevaluationDailyReminders,
  sendTrainerPendingRevaluationInspectionReminders,
  sendSetValidityReminders
);

const studentPlanExpirationRepository = new SequelizeStudentPlanExpirationRepository({
  Student: models.Student,
});
startStudentPlanExpirationScheduler(
  new ExpireStudentPlansUseCase(
    studentPlanExpirationRepository,
    new CognitoStudentSessionInvalidator()
  )
);

const notificationsController = new NotificationsController(
  new ListNotificationsUseCase(notificationsRepository),
  new GetNotificationUseCase(notificationsRepository),
  new MarkNotificationReadUseCase(notificationsRepository),
  new MarkAllNotificationsReadUseCase(notificationsRepository),
  new MarkConversationNotificationsReadUseCase(notificationsRepository)
);
app.use(
  '/notifications',
  createNotificationsRoutes(notificationsController, requireAuth, requireStudentOrTrainer)
);

const conversationsRepository = new SequelizeConversationsRepository({
  Conversation: models.Conversation,
  Student: models.Student,
  Trainer: models.Trainer,
});
const conversationRealtimeHub = new ConversationRealtimeHub();
const conversationMessageNotifier = new SequelizeConversationMessageNotifier({
  Notification: models.Notification,
  Student: models.Student,
  Trainer: models.Trainer,
});
const appendConversationTurnUseCase = new AppendConversationTurnUseCase(
  conversationsRepository,
  conversationRealtimeHub,
  conversationMessageNotifier,
  conversationRealtimeHub
);
const listConversationMessagesUseCase = new ListConversationMessagesUseCase(
  conversationsRepository
);
const getConversationPartnerUseCase = new GetConversationPartnerUseCase(
  conversationsRepository
);
const conversationsController = new ConversationsController(
  listConversationMessagesUseCase,
  getConversationPartnerUseCase
);
app.use(
  '/conversations',
  createConversationsRoutes(conversationsController, requireAuth, requireStudentOrTrainer)
);

const studentSharedController = new StudentSharedController(
  new GetStudentWasExclusiveUseCase(trainerStudentsRepository)
);
app.use(
  '/students',
  createStudentSharedRoutes(studentSharedController, requireAuth, requireStudentOrTrainer)
);
app.use(
  '/semester-promotion',
  createSemesterPromotionRoutes(
    semesterPromotionController,
    requireAuth,
    requireStudentOrTrainer
  )
);

const appVersionRepository = new SequelizeAppVersionRepository({ AppVersion: models.AppVersion });
const appVersionController = new AppVersionController(
  new GetAppVersionUseCase(appVersionRepository),
  new CreateAppVersionUseCase(appVersionRepository),
  new UpdateAppVersionUseCase(appVersionRepository)
);
app.use('/version', createAppVersionRoutes(appVersionController, requireAuth, requireTrainer));

const eduzzWebhookSecret = process.env.EDUZZ_WEBHOOK_SECRET?.trim() || null;
const eduzzStudentPlanRepository = new SequelizeEduzzStudentPlanRepository({
  Student: models.Student,
});
const eduzzWebhookController = new EduzzWebhookController(
  new ProcessEduzzWebhookUseCase(eduzzStudentPlanRepository, eduzzWebhookSecret)
);
app.use('/webhooks/eduzz', createEduzzWebhookRoutes(eduzzWebhookController));

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
