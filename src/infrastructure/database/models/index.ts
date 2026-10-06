import type { Sequelize } from 'sequelize';
import { initTrainer, Trainer } from './trainer.model';
import { initStudent, Student } from './student.model';
import { initAnamnesis, Anamnesis } from './anamnesis.model';
import { initAnamnesisExclusive, AnamnesisExclusive } from './anamnesis-exclusive.model';
import { initPhysical, Physical } from './physical.model';
import { initConversation, Conversation } from './conversation.model';
import { initPost, Post } from './post.model';
import { initLike, Like } from './like.model';
import { initComment, Comment } from './comment.model';
import { initEvolution, Evolution } from './evolution.model';
import { initDivision, Division } from './division.model';
import { initProgram, Program } from './program.model';
import { initExercise, Exercise } from './exercise.model';
import { initSet, Set } from './set.model';
import { initTraining, Training } from './training.model';
import { initExercisesToPrograms, ExercisesToPrograms } from './exercises-to-programs.model';
import { initExercisesToTrainings, ExercisesToTrainings } from './exercises-to-trainings.model';
import { initSetsToTrainings, SetsToTrainings } from './sets-to-trainings.model';
import { initSetsToStudents, SetsToStudents } from './sets-to-students.model';
import { initTrainingsToPrograms, TrainingsToPrograms } from './trainings-to-programs.model';
import { initProgramsToStudents, ProgramsToStudents } from './programs-to-students.model';
import { initRepsToExercises, RepsToExercises } from './reps-to-exercises.model';
import { initRepsToTrainings, RepsToTrainings } from './reps-to-trainings.model';
import { initObsToTrainings, ObsToTrainings } from './obs-to-trainings.model';
import { initPoint, Point } from './point.model';
import { initFeedback, Feedback } from './feedback.model';
import { initResponsesFeedback, ResponsesFeedback } from './responses-feedback.model';
import { initNotification, Notification } from './notification.model';
import { initCoupon, Coupon } from './coupon.model';
import { initWellbeing, Wellbeing } from './wellbeing.model';
import { initWell, Well } from './well.model';
import { initRevaluation, Revaluation } from './revaluation.model';
import { initNotice, Notice } from './notice.model';
import { initAppVersion, AppVersion } from './app-version.model';
import { initFolder, Folder } from './folder.model';
import { initFoldersToType, FoldersToType } from './folders-to-type.model';
import { initMethodProgram, MethodProgram } from './method-program.model';
import { initMethod, Method } from './method.model';
import { initPlaylist, Playlist } from './playlist.model';
import { initIntroduction, Introduction } from './introduction.model';
import { initContent, Content } from './content.model';

export type DatabaseModels = {
  Trainer: typeof Trainer;
  Student: typeof Student;
  Anamnesis: typeof Anamnesis;
  AnamnesisExclusive: typeof AnamnesisExclusive;
  Physical: typeof Physical;
  Conversation: typeof Conversation;
  Post: typeof Post;
  Like: typeof Like;
  Comment: typeof Comment;
  Evolution: typeof Evolution;
  Division: typeof Division;
  Program: typeof Program;
  Exercise: typeof Exercise;
  Set: typeof Set;
  Training: typeof Training;
  ExercisesToPrograms: typeof ExercisesToPrograms;
  TrainingsToPrograms: typeof TrainingsToPrograms;
  ProgramsToStudents: typeof ProgramsToStudents;
  ExercisesToTrainings: typeof ExercisesToTrainings;
  SetsToTrainings: typeof SetsToTrainings;
  SetsToStudents: typeof SetsToStudents;
  RepsToExercises: typeof RepsToExercises;
  RepsToTrainings: typeof RepsToTrainings;
  ObsToTrainings: typeof ObsToTrainings;
  Point: typeof Point;
  Feedback: typeof Feedback;
  ResponsesFeedback: typeof ResponsesFeedback;
  Notification: typeof Notification;
  Coupon: typeof Coupon;
  Wellbeing: typeof Wellbeing;
  Well: typeof Well;
  Revaluation: typeof Revaluation;
  Notice: typeof Notice;
  AppVersion: typeof AppVersion;
  Folder: typeof Folder;
  FoldersToType: typeof FoldersToType;
  MethodProgram: typeof MethodProgram;
  Method: typeof Method;
  Playlist: typeof Playlist;
  Introduction: typeof Introduction;
  Content: typeof Content;
};

function associate(models: DatabaseModels): void {
  const {
    Trainer,
    Student,
    Anamnesis,
    AnamnesisExclusive,
    Physical,
    Conversation,
    Post,
    Like,
    Comment,
    Evolution,
    Division,
    Program,
    Exercise,
    Set,
    Training,
    ExercisesToPrograms,
    TrainingsToPrograms,
    ProgramsToStudents,
    ExercisesToTrainings,
    SetsToTrainings,
    SetsToStudents,
    RepsToExercises,
    RepsToTrainings,
    ObsToTrainings,
    Point,
    Feedback,
    ResponsesFeedback,
    Notification,
    Wellbeing,
    Well,
    Revaluation,
    Notice,
    Folder,
    FoldersToType,
    MethodProgram,
    Method,
    Playlist,
    Introduction,
    Content,
  } = models;

  Trainer.hasMany(Student, { foreignKey: 'trainer_id', as: 'students' });
  Student.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });

  Student.hasMany(Anamnesis, { foreignKey: 'student_id', as: 'anamneses' });
  Anamnesis.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(AnamnesisExclusive, { foreignKey: 'student_id', as: 'anamnesis_exclusives' });
  AnamnesisExclusive.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(Physical, { foreignKey: 'student_id', as: 'physicals' });
  Physical.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(Conversation, { foreignKey: 'student_id', as: 'conversations' });
  Conversation.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(Evolution, { foreignKey: 'student_id', as: 'evolutions' });
  Evolution.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(Revaluation, { foreignKey: 'student_id', as: 'revaluations' });
  Revaluation.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Trainer.hasMany(Notice, { foreignKey: 'trainer_id', as: 'notices' });
  Notice.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });

  Post.hasMany(Like, { foreignKey: 'post_id', as: 'likes' });
  Like.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

  Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
  Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

  Student.hasMany(Division, { foreignKey: 'student_id', as: 'divisions' });
  Division.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Training.hasMany(SetsToTrainings, { foreignKey: 'training_id', as: 'sets_to_trainings' });
  Set.hasMany(SetsToTrainings, { foreignKey: 'set_id', as: 'sets_to_trainings' });
  SetsToTrainings.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });
  SetsToTrainings.belongsTo(Set, { foreignKey: 'set_id', as: 'set' });

  Student.hasMany(SetsToStudents, { foreignKey: 'student_id', as: 'sets_to_students' });
  SetsToStudents.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Set.hasMany(SetsToStudents, { foreignKey: 'sets_id', as: 'sets_to_students' });
  SetsToStudents.belongsTo(Set, { foreignKey: 'sets_id', as: 'set' });

  // N:N Programs <-> Exercises
  Program.belongsToMany(Exercise, {
    through: ExercisesToPrograms,
    foreignKey: 'program_id',
    otherKey: 'exercise_id',
    as: 'exercises',
  });
  Exercise.belongsToMany(Program, {
    through: ExercisesToPrograms,
    foreignKey: 'exercise_id',
    otherKey: 'program_id',
    as: 'programs',
  });
  Program.hasMany(ExercisesToPrograms, { foreignKey: 'program_id', as: 'exercises_to_programs' });
  Exercise.hasMany(ExercisesToPrograms, { foreignKey: 'exercise_id', as: 'exercises_to_programs' });
  ExercisesToPrograms.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });
  ExercisesToPrograms.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

  Program.belongsToMany(Training, {
    through: TrainingsToPrograms,
    foreignKey: 'program_id',
    otherKey: 'training_id',
    as: 'trainings',
  });
  Training.belongsToMany(Program, {
    through: TrainingsToPrograms,
    foreignKey: 'training_id',
    otherKey: 'program_id',
    as: 'programs',
  });
  Program.hasMany(TrainingsToPrograms, { foreignKey: 'program_id', as: 'trainings_to_programs' });
  Training.hasMany(TrainingsToPrograms, { foreignKey: 'training_id', as: 'trainings_to_programs' });
  TrainingsToPrograms.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });
  TrainingsToPrograms.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });

  Student.hasMany(ProgramsToStudents, { foreignKey: 'student_id', as: 'programs_to_students' });
  ProgramsToStudents.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Program.hasMany(ProgramsToStudents, { foreignKey: 'program_id', as: 'programs_to_students' });
  ProgramsToStudents.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });

  // N:N Trainings <-> Exercises
  Training.belongsToMany(Exercise, {
    through: ExercisesToTrainings,
    foreignKey: 'training_id',
    otherKey: 'exercise_id',
    as: 'exercises',
  });
  Exercise.belongsToMany(Training, {
    through: ExercisesToTrainings,
    foreignKey: 'exercise_id',
    otherKey: 'training_id',
    as: 'trainings',
  });
  Training.hasMany(ExercisesToTrainings, { foreignKey: 'training_id', as: 'exercises_to_trainings' });
  Exercise.hasMany(ExercisesToTrainings, {
    foreignKey: 'exercise_id',
    as: 'exercises_to_trainings',
  });
  ExercisesToTrainings.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });
  ExercisesToTrainings.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

  Student.hasMany(RepsToExercises, { foreignKey: 'student_id', as: 'reps_to_exercises' });
  RepsToExercises.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Exercise.hasMany(RepsToExercises, { foreignKey: 'exercise_id', as: 'reps_to_exercises' });
  RepsToExercises.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

  Training.hasMany(RepsToExercises, { foreignKey: 'training_id', as: 'reps_to_exercises' });
  RepsToExercises.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });

  Exercise.hasMany(RepsToTrainings, { foreignKey: 'exercise_id', as: 'reps_to_trainings' });
  RepsToTrainings.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });

  Training.hasMany(RepsToTrainings, { foreignKey: 'training_id', as: 'reps_to_trainings' });
  RepsToTrainings.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });

  Student.hasMany(ObsToTrainings, { foreignKey: 'student_id', as: 'obs_to_trainings' });
  ObsToTrainings.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Training.hasMany(ObsToTrainings, { foreignKey: 'training_id', as: 'obs_to_trainings' });
  ObsToTrainings.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });

  Student.hasMany(Point, { foreignKey: 'student_id', as: 'points' });
  Point.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Student.hasMany(Feedback, { foreignKey: 'student_id', as: 'feedbacks' });
  Feedback.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Feedback.hasMany(ResponsesFeedback, { foreignKey: 'feedback_id', as: 'responses' });
  ResponsesFeedback.belongsTo(Feedback, { foreignKey: 'feedback_id', as: 'feedback' });

  Trainer.hasMany(Notification, { foreignKey: 'trainer_id', as: 'notifications' });
  Notification.belongsTo(Trainer, { foreignKey: 'trainer_id', as: 'trainer' });

  Student.hasMany(Notification, { foreignKey: 'student_id', as: 'notifications' });
  Notification.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });

  Wellbeing.hasMany(Well, { foreignKey: 'wellbeing_id', as: 'wells' });
  Well.belongsTo(Wellbeing, { foreignKey: 'wellbeing_id', as: 'wellbeing' });

  Folder.hasMany(FoldersToType, { foreignKey: 'folder_id', as: 'folders_to_type' });
  FoldersToType.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });
  Training.hasMany(FoldersToType, { foreignKey: 'training_id', as: 'folders_to_type' });
  FoldersToType.belongsTo(Training, { foreignKey: 'training_id', as: 'training' });
  Exercise.hasMany(FoldersToType, { foreignKey: 'exercise_id', as: 'folders_to_type' });
  FoldersToType.belongsTo(Exercise, { foreignKey: 'exercise_id', as: 'exercise' });
  Set.hasMany(FoldersToType, { foreignKey: 'set_id', as: 'folders_to_type' });
  FoldersToType.belongsTo(Set, { foreignKey: 'set_id', as: 'set' });

  MethodProgram.hasMany(Method, { foreignKey: 'method_program_id', as: 'methods' });
  Method.belongsTo(MethodProgram, { foreignKey: 'method_program_id', as: 'method_program' });

  Program.hasMany(Introduction, { foreignKey: 'program_id', as: 'introductions' });
  Introduction.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });
  Introduction.hasMany(Content, { foreignKey: 'introduction_id', as: 'contents' });
  Content.belongsTo(Introduction, { foreignKey: 'introduction_id', as: 'introduction' });
}

export function initModels(sequelize: Sequelize): DatabaseModels {
  const TrainerModel = initTrainer(sequelize);
  const StudentModel = initStudent(sequelize);
  const AnamnesisModel = initAnamnesis(sequelize);
  const AnamnesisExclusiveModel = initAnamnesisExclusive(sequelize);
  const PhysicalModel = initPhysical(sequelize);
  const ConversationModel = initConversation(sequelize);
  const PostModel = initPost(sequelize);
  const LikeModel = initLike(sequelize);
  const CommentModel = initComment(sequelize);
  const EvolutionModel = initEvolution(sequelize);
  const DivisionModel = initDivision(sequelize);
  const ProgramModel = initProgram(sequelize);
  const ExerciseModel = initExercise(sequelize);
  const SetModel = initSet(sequelize);
  const TrainingModel = initTraining(sequelize);
  const ExercisesToProgramsModel = initExercisesToPrograms(sequelize);
  const TrainingsToProgramsModel = initTrainingsToPrograms(sequelize);
  const ProgramsToStudentsModel = initProgramsToStudents(sequelize);
  const ExercisesToTrainingsModel = initExercisesToTrainings(sequelize);
  const SetsToTrainingsModel = initSetsToTrainings(sequelize);
  const SetsToStudentsModel = initSetsToStudents(sequelize);
  const RepsToExercisesModel = initRepsToExercises(sequelize);
  const RepsToTrainingsModel = initRepsToTrainings(sequelize);
  const ObsToTrainingsModel = initObsToTrainings(sequelize);
  const PointModel = initPoint(sequelize);
  const FeedbackModel = initFeedback(sequelize);
  const ResponsesFeedbackModel = initResponsesFeedback(sequelize);
  const NotificationModel = initNotification(sequelize);
  const CouponModel = initCoupon(sequelize);
  const WellbeingModel = initWellbeing(sequelize);
  const WellModel = initWell(sequelize);
  const RevaluationModel = initRevaluation(sequelize);
  const NoticeModel = initNotice(sequelize);
  const AppVersionModel = initAppVersion(sequelize);
  const FolderModel = initFolder(sequelize);
  const FoldersToTypeModel = initFoldersToType(sequelize);
  const MethodProgramModel = initMethodProgram(sequelize);
  const MethodModel = initMethod(sequelize);
  const PlaylistModel = initPlaylist(sequelize);
  const IntroductionModel = initIntroduction(sequelize);
  const ContentModel = initContent(sequelize);

  const models: DatabaseModels = {
    Trainer: TrainerModel,
    Student: StudentModel,
    Anamnesis: AnamnesisModel,
    AnamnesisExclusive: AnamnesisExclusiveModel,
    Physical: PhysicalModel,
    Conversation: ConversationModel,
    Post: PostModel,
    Like: LikeModel,
    Comment: CommentModel,
    Evolution: EvolutionModel,
    Division: DivisionModel,
    Program: ProgramModel,
    Exercise: ExerciseModel,
    Set: SetModel,
    Training: TrainingModel,
    ExercisesToPrograms: ExercisesToProgramsModel,
    TrainingsToPrograms: TrainingsToProgramsModel,
    ProgramsToStudents: ProgramsToStudentsModel,
    ExercisesToTrainings: ExercisesToTrainingsModel,
    SetsToTrainings: SetsToTrainingsModel,
    SetsToStudents: SetsToStudentsModel,
    RepsToExercises: RepsToExercisesModel,
    RepsToTrainings: RepsToTrainingsModel,
    ObsToTrainings: ObsToTrainingsModel,
    Point: PointModel,
    Feedback: FeedbackModel,
    ResponsesFeedback: ResponsesFeedbackModel,
    Notification: NotificationModel,
    Coupon: CouponModel,
    Wellbeing: WellbeingModel,
    Well: WellModel,
    Revaluation: RevaluationModel,
    Notice: NoticeModel,
    AppVersion: AppVersionModel,
    Folder: FolderModel,
    FoldersToType: FoldersToTypeModel,
    MethodProgram: MethodProgramModel,
    Method: MethodModel,
    Playlist: PlaylistModel,
    Introduction: IntroductionModel,
    Content: ContentModel,
  };

  associate(models);

  return models;
}

export {
  Trainer,
  Student,
  Anamnesis,
  AnamnesisExclusive,
  Physical,
  Conversation,
  Post,
  Like,
  Comment,
  Evolution,
  Division,
  Program,
  Exercise,
  Set,
  Training,
  ExercisesToPrograms,
  TrainingsToPrograms,
  ProgramsToStudents,
  ExercisesToTrainings,
  SetsToTrainings,
  SetsToStudents,
  RepsToExercises,
  RepsToTrainings,
  ObsToTrainings,
  Point,
  Feedback,
  ResponsesFeedback,
  Notification,
  Coupon,
  Wellbeing,
  Well,
  Revaluation,
  Notice,
  AppVersion,
  Folder,
  FoldersToType,
  MethodProgram,
  Method,
  Playlist,
  Introduction,
  Content,
};
