export interface IStudentSessionInvalidator {
  signOutStudent(studentId: string): Promise<void>;
}
