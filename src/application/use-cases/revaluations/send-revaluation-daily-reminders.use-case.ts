import type { IRevaluationNotifier } from '../../ports/revaluation-notifier.port';
import type { IRevaluationsRepository } from '../../ports/revaluations.port';

export type SendRevaluationDailyRemindersResult = {
  students: number;
  notified: number;
};

export class SendRevaluationDailyRemindersUseCase {
  constructor(
    private readonly repo: IRevaluationsRepository,
    private readonly notifier: IRevaluationNotifier
  ) {}

  async execute(): Promise<SendRevaluationDailyRemindersResult> {
    const students = await this.repo.listStudentsPendingDailyReminder();
    let notified = 0;

    for (const student of students) {
      try {
        await this.notifier.notifyCompleteRevaluationReminder(
          student.id,
          student.trainer_id,
          student.expo_push_token
        );
        notified += 1;
      } catch (err) {
        console.error('[revaluation-notifications] daily:', student.id, err);
      }
    }

    return { students: students.length, notified };
  }
}
