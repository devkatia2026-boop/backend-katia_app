import { msUntilNextBrazilTime } from '../../application/parsing/calendar-month.parsing';
import type { SendRevaluationDailyRemindersUseCase } from '../../application/use-cases/revaluations/send-revaluation-daily-reminders.use-case';

const TARGET_HOUR = 12;

export function startRevaluationDailyReminderScheduler(
  sendReminders: SendRevaluationDailyRemindersUseCase
): void {
  let running = false;

  const run = (reason: 'scheduled') => {
    if (running) return;
    running = true;
    void sendReminders
      .execute()
      .then((result) => {
        console.log(`[revaluation-scheduler] lembretes diários (${reason})`, result);
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
