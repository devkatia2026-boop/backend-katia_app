export type TrainerProfileUpdateValues = Partial<{
  full_name: string;
  photo_perfil: string | null;
  phone: string | null;
  email: string;
  expo_push_token: string | null;
}>;

export type StudentProfileUpdateValues = Partial<{
  full_name: string;
  photo_perfil: string | null;
  phone: string | null;
  email: string;
  birth: string | null;
  cpf: string | null;
  type_plan: string | null;
  height: number | null;
  weight: number | null;
  expo_push_token: string | null;
}>;

export interface IUserProfileUpdater {
  updateTrainerProfile(id: string, values: TrainerProfileUpdateValues): Promise<void>;
  updateStudentProfile(id: string, values: StudentProfileUpdateValues): Promise<void>;
}
