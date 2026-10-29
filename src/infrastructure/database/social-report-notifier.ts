import type { DatabaseModels } from './models';
import type { ISocialReportNotifier, SocialReportContext } from '../../application/ports/social-report.port';

const TYPE_SOCIAL_REPORT = 'SOCIAL_REPORT';

export class SequelizeSocialReportNotifier implements ISocialReportNotifier {
  constructor(private readonly models: Pick<DatabaseModels, 'Notification' | 'Trainer'>) {}

  async notifyTrainerReport(context: SocialReportContext): Promise<void> {
    const title = 'Denúncia no feed';
    const message = context.notificationMessage;
    const data = {
      reportType: context.input.report_type,
      reporterStudentId: context.reporterStudentId,
      reporterName: context.reporterName,
      reportedName: context.reportedName,
      contentPreview: context.contentPreview,
      reason: context.input.reason,
      postId: context.input.post_id ?? null,
      commentId: context.input.comment_id ?? null,
      targetStudentId: context.input.target_id ?? null,
      summary: context.subjectSummary,
    };

    await this.models.Notification.create({
      student_id: null,
      trainer_id: context.trainerId,
      title,
      message,
      read: false,
      type: TYPE_SOCIAL_REPORT,
      data,
    });

    const trainer = await this.models.Trainer.findByPk(context.trainerId, {
      attributes: ['expo_push_token'],
    });
    const token = trainer?.expo_push_token?.trim();
    if (!token) return;

    try {
      const Expo = (await import('expo-server-sdk')).default;
      if (!Expo.isExpoPushToken(token)) return;
      const client = new Expo();
      await client.sendPushNotificationsAsync([
        {
          to: token,
          sound: 'default',
          title,
          body: message,
          data,
        },
      ]);
    } catch (err) {
      console.error('[social-report] push trainer failed', err);
    }
  }
}
