import { msUntilNextBrazilTime } from '../../application/parsing/calendar-month.parsing';
import type { SendRevaluationDailyRemindersUseCase } from '../../application/use-cases/revaluations/send-revaluation-daily-reminders.use-case';
import type { SendTrainerPendingRevaluationInspectionRemindersUseCase } from '../../application/use-cases/revaluations/send-trainer-pending-revaluation-inspection-reminders.use-case';

import type { SendSetValidityRemindersUseCase } from '../../application/use-cases/sets-to-students/send-set-validity-reminders.use-case';

const TARGET_HOUR = 12;

export function startRevaluationDailyReminderScheduler(
  sendStudentReminders: SendRevaluationDailyRemindersUseCase,
  sendTrainerPendingInspectionReminders: SendTrainerPendingRevaluationInspectionRemindersUseCase,
  sendSetValidityReminders: SendSetValidityRemindersUseCase
): void {
  let running = false;

  const run = (reason: 'scheduled') => {
    if (running) return;
    running = true;

    void Promise.all([
      sendStudentReminders.execute(),
      sendTrainerPendingInspectionReminders.execute(),
      sendSetValidityReminders.execute(),
    ])
      .then(([studentResult, trainerResult, setValidityResult]) => {
        console.log(`[revaluation-scheduler] lembretes diários (${reason})`, {
          studentResult,
          trainerResult,
          setValidityResult,
        });
      })
      .catch((err) => {
        console.error('[revaluation-scheduler] falha ao enviar lembretes:', err);
      })
      .finally(() => {
        running = false;
      });
  };

  const scheduleNextRun = () => {
    const delayMs = msUntilNextBrazilTime(TARGET_HOUR, 0);
    setTimeout(() => {
      run('scheduled');
      scheduleNextRun();
    }, delayMs);
  };

  scheduleNextRun();
}
