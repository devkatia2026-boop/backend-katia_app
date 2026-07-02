export interface IStudentAccountRepository {
  deleteAllDataForStudent(studentId: string): Promise<void>;
}
