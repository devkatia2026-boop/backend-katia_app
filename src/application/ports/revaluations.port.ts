export type RevaluationDTO = {
  id: number;
  student_id: string;
  front_photo: string | null;
  side_photo: string | null;
  back_photo: string | null;
  current_weight: number | null;
  monthly_rating: number | null;
  biggest_achievement: string | null;
  biggest_challenge: string | null;
  training_fit_routine: boolean | null;
  favorite_workout: string | null;
  least_favorite_or_difficult_exercise: string | null;
  nutrition_rating: number | null;
  energy_rating: number | null;
  body_changes: string | null;
  pain_or_adjustments: string | null;
  next_month_goal: string | null;
  proudest_moment: string | null;
  created_at: Date;
};

export type RevaluationUpsertValues = Partial<{
  front_photo: string | null;
  side_photo: string | null;
  back_photo: string | null;
  current_weight: number | null;
  monthly_rating: number | null;
  biggest_achievement: string | null;
  biggest_challenge: string | null;
  training_fit_routine: boolean | null;
  favorite_workout: string | null;
  least_favorite_or_difficult_exercise: string | null;
  nutrition_rating: number | null;
  energy_rating: number | null;
  body_changes: string | null;
  pain_or_adjustments: string | null;
  next_month_goal: string | null;
  proudest_moment: string | null;
}>;

export type RevaluationCompareResult = {
  student_id: string;
  first: RevaluationDTO;
  second: RevaluationDTO;
};

export type RevaluationStudentReminder = {
  id: string;
  trainer_id: string;
  expo_push_token: string | null;
};

export interface IRevaluationsRepository {
  createForStudent(studentId: string, values: RevaluationUpsertValues): Promise<RevaluationDTO>;
  listByStudentId(studentId: string): Promise<RevaluationDTO[]>;
  listForTrainerStudent(trainerId: string, studentId: string): Promise<RevaluationDTO[]>;
  findByIdForTrainerStudent(
    trainerId: string,
    studentId: string,
    revaluationId: number
  ): Promise<RevaluationDTO | null>;
  compareForTrainerStudent(
    trainerId: string,
    studentId: string,
    firstId: number,
    secondId: number
  ): Promise<RevaluationCompareResult | null>;
  getInRevalutionStatus(studentId: string): Promise<boolean>;
  finishRevalution(studentId: string): Promise<void>;
  listStudentsPendingDailyReminder(): Promise<RevaluationStudentReminder[]>;
  startRevaluationForTrainer(
    trainerId: string,
    studentIds?: string[]
  ): Promise<RevaluationStudentReminder[]>;
}
