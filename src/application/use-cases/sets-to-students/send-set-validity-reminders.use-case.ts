import { addDaysToBrazilDate, getBrazilDateContext } from '../../parsing/set-order-schedule.parsing';
import type { ISetValidityNotifier, SetValidityReminderMilestone } from '../../ports/set-validity-notifier.port';
import type { ISetsToStudentsRepository } from '../../ports/sets-to-students.port';

export type SendSetValidityRemindersResult = {
  scanned: number;
  eligible: number;
  notified: number;
};

export class SendSetValidityRemindersUseCase {
  constructor(
    private readonly repo: ISetsToStudentsRepository,
    private readonly notifier: ISetValidityNotifier
  ) {}

  async execute(): Promise<SendSetValidityRemindersResult> {
    const todayIso = getBrazilDateContext().date;
    const in7Days = addDaysToBrazilDate(todayIso, 7);
    const in3Days = addDaysToBrazilDate(todayIso, 3);
    const links = await this.repo.listActiveSetsWithValidityForReminders();

    let eligible = 0;
    let notified = 0;

    for (const link of links) {
      const milestone = resolveMilestone(link.validity, todayIso, in7Days, in3Days);

      if (!milestone) {
        continue;
      }

      eligible += 1;

      try {
        const sent = await this.notifier.notifyTrainerSetValidityReminder({
          ...link,
          milestone,
          todayIso,
        });

        if (sent) {
          notified += 1;
        }
      } catch (err) {
        console.error('[set-validity-notifications]', link.id, err);
      }
    }

    return {
      scanned: links.length,
      eligible,
      notified,
    };
  }
}

function resolveMilestone(
  validity: string,
  todayIso: string,
  in7Days: string,
  in3Days: string
): SetValidityReminderMilestone | null {
  if (validity === in7Days) {
    return '7d';
  }

  if (validity === in3Days) {
    return '3d';
  }

  if (validity === todayIso) {
    return 'today';
  }

  if (validity < todayIso) {
    return 'past';
  }

  return null;
}
