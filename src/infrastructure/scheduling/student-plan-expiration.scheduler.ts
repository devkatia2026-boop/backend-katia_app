import { msUntilNextBrazilTime } from '../../application/parsing/calendar-month.parsing';
import type { ExpireStudentPlansUseCase } from '../../application/use-cases/student-plans/expire-student-plans.use-case';

const TARGET_HOUR = 0;

export function startStudentPlanExpirationScheduler(
  expireStudentPlans: ExpireStudentPlansUseCase
): void {
  let running = false;

  const run = (reason: 'scheduled') => {
    if (running) return;
    running = true;

    void expireStudentPlans
      .execute()
      .then((result) => {
        console.log(`[student-plan-expiration] expiração diária (${reason})`, result);
      })
      .catch((err) => {
        console.error('[student-plan-expiration] falha ao expirar planos:', err);
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
