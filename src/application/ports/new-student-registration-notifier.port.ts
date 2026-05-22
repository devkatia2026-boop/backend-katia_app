export interface NewStudentRegisteredInput {
  trainerId: string;
  studentId: string;
  studentName: string;
}

export interface INewStudentRegistrationNotifier {
  notifyNewStudentRegistered(input: NewStudentRegisteredInput): Promise<void>;
}
