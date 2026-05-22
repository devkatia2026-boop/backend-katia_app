export interface StudentPointCreatedInput {
  trainerId: string;
  studentId: string;
  studentName: string;
  pointId: number;
}

export interface IPointCreatedNotifier {
  notifyStudentPointCreated(input: StudentPointCreatedInput): Promise<void>;
}
