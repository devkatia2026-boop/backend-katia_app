export interface CreateTrainerProfileInput {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
}

export interface CreateStudentProfileInput {
  id: string;
  trainerId: string;
  email: string;
  fullName: string;
  phone: string | null;
}

export interface IUserProfileWriter {
  trainerExistsById(id: string): Promise<boolean>;
  findStudentByEmail(email: string): Promise<{ id: string } | null>;
  findTrainerByEmail(email: string): Promise<{ id: string } | null>;
  createTrainerProfile(input: CreateTrainerProfileInput): Promise<void>;
  createStudentProfile(input: CreateStudentProfileInput): Promise<void>;
}
