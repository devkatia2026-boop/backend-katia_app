import {
  isBrazilFirstDayOnOrAfterHour,
  msUntilNextBrazilTime,
} from '../../application/parsing/calendar-month.parsing';
import type { SendLastMonthRankingChampionNotificationsUseCase } from '../../application/use-cases/rankings/send-last-month-ranking-champion-notifications.use-case';

const TARGET_HOUR = 6;

export function startRankingChampionNotificationScheduler(
  sendNotifications: SendLastMonthRankingChampionNotificationsUseCase
): void {
  let running = false;

  const runIfDue = (reason: 'startup' | 'scheduled') => {
    if (!isBrazilFirstDayOnOrAfterHour(TARGET_HOUR)) return;
    if (running) return;
    running = true;
    void sendNotifications
      .execute()
      .then((result) => {
        console.log(`[ranking-scheduler] notificações de campeãs (${reason})`, result);
      })
      .catch((err) => {
        console.error('[ranking-scheduler] falha ao enviar notificações:', err);
      })
      .finally(() => {
        running = false;
      });
  };

  const scheduleNextRun = () => {
    const delayMs = msUntilNextBrazilTime(TARGET_HOUR, 0);
    setTimeout(() => {
      runIfDue('scheduled');
      scheduleNextRun();
    }, delayMs);
  };

  runIfDue('startup');
  scheduleNextRun();
}
