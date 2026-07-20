import type { IRevaluationNotifier } from '../../ports/revaluation-notifier.port';
import type { IRevaluationsRepository } from '../../ports/revaluations.port';
import { parseStartRevaluationBody } from '../../parsing/start-revaluation-body.parsing';

export type StartTrainerStudentsRevaluationResult = {
  updated: number;
  notified: number;
};

export class StartTrainerStudentsRevaluationUseCase {
  constructor(
    private readonly revaluations: IRevaluationsRepository,
    private readonly notifier: IRevaluationNotifier
  ) {}

  async execute(
    trainerId: string,
    body: unknown
  ): Promise<StartTrainerStudentsRevaluationResult> {
    const { studentIds } = parseStartRevaluationBody(body);
    const students = await this.revaluations.startRevaluationForTrainer(trainerId, studentIds);

    let notified = 0;
    for (const student of students) {
      try {
        await this.notifier.notifyRevaluationStarted(
          student.id,
          student.trainer_id,
          student.expo_push_token
        );
        notified += 1;
      } catch (err) {
        console.error('[revaluation-notifications] start:', student.id, err);
      }
    }

    return { updated: students.length, notified };
  }
}
