export interface FeedbackResponseCreatedInput {
  studentId: string;
  trainerId: string;
  feedbackId: number;
}

export interface IFeedbackResponseNotifier {
  notifyFeedbackResponseCreated(input: FeedbackResponseCreatedInput): Promise<void>;
}
