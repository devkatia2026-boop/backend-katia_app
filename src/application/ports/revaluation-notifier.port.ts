export interface IRevaluationNotifier {
  notifyRevaluationStarted(
    studentId: string,
    trainerId: string,
    expoPushToken: string | null
  ): Promise<void>;
  notifyCompleteRevaluationReminder(
    studentId: string,
    trainerId: string,
    expoPushToken: string | null
  ): Promise<void>;
}
