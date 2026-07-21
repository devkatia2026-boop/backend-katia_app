import type { IRevaluationNotifier } from '../../ports/revaluation-notifier.port';
import type { IRevaluationsRepository } from '../../ports/revaluations.port';

export type SendTrainerPendingRevaluationInspectionRemindersResult = {
  trainers: number;
  notified: number;
};

export class SendTrainerPendingRevaluationInspectionRemindersUseCase {
  constructor(
    private readonly repo: IRevaluationsRepository,
    private readonly notifier: IRevaluationNotifier
  ) {}

  async execute(): Promise<SendTrainerPendingRevaluationInspectionRemindersResult> {
    const trainers = await this.repo.listTrainersWithPendingInspections();
    let notified = 0;

    for (const trainer of trainers) {
      if (trainer.pending_count <= 0) {
        continue;
      }

      try {
        await this.notifier.notifyTrainerPendingInspections(
          trainer.trainer_id,
          trainer.pending_count,
          trainer.expo_push_token
        );
        notified += 1;
      } catch (err) {
        console.error(
          '[revaluation-notifications] pending-inspections:',
          trainer.trainer_id,
          err
        );
      }
    }

    return { trainers: trainers.length, notified };
  }
}
