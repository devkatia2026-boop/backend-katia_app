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
  notifyRevaluationCompleted(
    studentId: string,
    trainerId: string,
    revaluationId: number,
    studentName: string
  ): Promise<void>;
  notifyTrainerPendingInspections(
    trainerId: string,
    pendingCount: number,
    expoPushToken: string | null
  ): Promise<void>;
}
