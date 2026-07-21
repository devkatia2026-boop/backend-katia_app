import type { SetValidityReminderLink } from './sets-to-students.port';

export type SetValidityReminderMilestone = '7d' | '3d' | 'today' | 'past';

export type SetValidityReminderNotifyInput = SetValidityReminderLink & {
  milestone: SetValidityReminderMilestone;
  todayIso: string;
};

export interface ISetValidityNotifier {
  notifyTrainerSetValidityReminder(input: SetValidityReminderNotifyInput): Promise<boolean>;
}
