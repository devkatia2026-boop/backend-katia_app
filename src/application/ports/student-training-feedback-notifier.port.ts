export interface StudentTrainingFeedbackCreatedInput {
  trainerId: string;
  studentId: string;
  studentName: string;
  feedbackId: number;
}

export interface IStudentTrainingFeedbackCreatedNotifier {
  notifyTrainingFeedbackCreated(input: StudentTrainingFeedbackCreatedInput): Promise<void>;
}
