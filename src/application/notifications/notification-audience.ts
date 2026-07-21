import { Op, type WhereOptions } from 'sequelize';

export const TRAINER_NOTIFICATION_TYPES_WITH_STUDENT_CONTEXT = [
  'STUDENT_TRAINING_FEEDBACK_CREATED',
  'STUDENT_POINT_CREATED',
  'NEW_STUDENT_REGISTRATION',
  'SET_VALIDITY_REMINDER_7D',
  'SET_VALIDITY_REMINDER_3D',
  'SET_VALIDITY_REMINDER_TODAY',
  'SET_VALIDITY_PAST',
] as const;

export const TRAINER_INBOX_TYPES_WITH_STUDENT_ID = [
  ...TRAINER_NOTIFICATION_TYPES_WITH_STUDENT_CONTEXT,
  'REVALUATION_COMPLETED',
] as const;

export const TRAINER_ONLY_NOTIFICATION_TYPES = [
  ...TRAINER_NOTIFICATION_TYPES_WITH_STUDENT_CONTEXT,
  'REVALUATION_COMPLETED',
  'REVALUATION_PENDING_INSPECTIONS',
] as const;

export const STUDENT_ONLY_NOTIFICATION_TYPES = [
  'REVALUATION_STARTED',
  'REVALUATION_COMPLETE_REMINDER',
  'FEEDBACK_RESPONSE_CREATED',
  'NOTICE_CREATED',
  'SET_ASSIGNED_TO_STUDENT',
  'COUPON_CREATED',
  'WELLBEING_CREATED',
  'PROGRAM_CREATED',
] as const;

export type NotificationViewer = {
  role: 'student' | 'trainer';
  sub: string;
};

export function buildNotificationsWhereForViewer(viewer: NotificationViewer): WhereOptions {
  if (viewer.role === 'student') {
    return {
      student_id: viewer.sub,
      type: { [Op.notIn]: [...TRAINER_ONLY_NOTIFICATION_TYPES] },
    };
  }

  return {
    trainer_id: viewer.sub,
    [Op.and]: [
      { type: { [Op.notIn]: [...STUDENT_ONLY_NOTIFICATION_TYPES] } },
      {
        [Op.or]: [
          { student_id: null },
          {
            type: {
              [Op.in]: [...TRAINER_INBOX_TYPES_WITH_STUDENT_ID],
            },
          },
        ],
      },
    ],
  };
}

export function buildNotificationIdWhereForViewer(
  id: number,
  viewer: NotificationViewer
): WhereOptions {
  return {
    id,
    ...buildNotificationsWhereForViewer(viewer),
  };
}
