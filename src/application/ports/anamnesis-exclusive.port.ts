export type AnamnesisExclusiveDTO = {
  id: number;
  student_id: string;
  full_name: string | null;
  adress: string | null;
  birth: string | null;
  city_country: string | null;
  profession: string | null;
  whatsapp: string | null;
  instagram: string | null;
  indication: string | null;
  link_medical_request: string | null;
  weight: number | null;
  heigth: number | null;
  waist: number | null;
  abdomen: number | null;
  hip: number | null;
  photos_posture: string | null;
  photos_up_leg: string | null;
  photos_up_arms: string | null;
  photos_up_leg_dois: string | null;
  photos_sit: string | null;
  have_a_children: boolean | null;
  objective: string | null;
  nutritional_monitoring: string | null;
  link_food_planning: string | null;
  biggest_challenge: string | null;
  already_training: string | null;
  weekly_training_quantity: number | null;
  time_training: number | null;
  pain: string | null;
  link_current_workout: string | null;
  level_trianing: number | null;
  link_woman_inspiration: string | null;
  reason: string | null;
  size_shirt: string | null;
  size_leggin: string | null;
  size_top: string | null;
  number_shoe: number | null;
  created_at: Date;
};

export type AnamnesisExclusiveUpsertValues = Partial<{
  full_name: string | null;
  adress: string | null;
  birth: string | null;
  city_country: string | null;
  profession: string | null;
  whatsapp: string | null;
  instagram: string | null;
  indication: string | null;
  link_medical_request: string | null;
  weight: number | null;
  heigth: number | null;
  waist: number | null;
  abdomen: number | null;
  hip: number | null;
  photos_posture: string | null;
  photos_up_leg: string | null;
  photos_up_arms: string | null;
  photos_up_leg_dois: string | null;
  photos_sit: string | null;
  have_a_children: boolean | null;
  objective: string | null;
  nutritional_monitoring: string | null;
  link_food_planning: string | null;
  biggest_challenge: string | null;
  already_training: string | null;
  weekly_training_quantity: number | null;
  time_training: number | null;
  pain: string | null;
  link_current_workout: string | null;
  level_trianing: number | null;
  link_woman_inspiration: string | null;
  reason: string | null;
  size_shirt: string | null;
  size_leggin: string | null;
  size_top: string | null;
  number_shoe: number | null;
}>;

export type AnamnesisExclusiveCompletionResult = {
  student_id: string;
  complete: boolean;
  missing_fields: string[];
};

export interface IAnamnesisExclusiveRepository {
  findById(id: number): Promise<AnamnesisExclusiveDTO | null>;
  findLatestByStudentId(studentId: string): Promise<AnamnesisExclusiveDTO | null>;
  createForStudent(
    studentId: string,
    values: AnamnesisExclusiveUpsertValues
  ): Promise<AnamnesisExclusiveDTO>;
  isStudentOfTrainer(trainerId: string, studentId: string): Promise<boolean>;
}
