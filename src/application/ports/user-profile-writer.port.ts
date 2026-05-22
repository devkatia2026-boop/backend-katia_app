export interface CreateTrainerProfileInput {
  id: string;
  email: string;
  fullName: string;
}

export interface CreateStudentProfileInput {
  id: string;
  trainerId: string;
  email: string;
  fullName: string;
}

export interface IUserProfileWriter {
  trainerExistsById(id: string): Promise<boolean>;
  createTrainerProfile(input: CreateTrainerProfileInput): Promise<void>;
  createStudentProfile(input: CreateStudentProfileInput): Promise<void>;
}
