import { parseFeedbackResponseCreateBody } from '../../parsing/feedback-response-body.parsing';
import type { IFeedbackResponseNotifier } from '../../ports/feedback-response-notifier.port';
import type { FeedbackResponseDTO, IFeedbackResponsesRepository } from '../../ports/feedback-responses.port';
import type { IFeedbacksRepository } from '../../ports/feedbacks.port';
import { assertFeedbackViewerAccess } from './assert-feedback-viewer-access';

const FORBIDDEN = 'ForbiddenException';

export class CreateFeedbackResponseUseCase {
  constructor(
    private readonly feedbacks: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository,
    private readonly notifier: IFeedbackResponseNotifier
  ) {}

  async execute(
    feedbackId: number,
    body: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<FeedbackResponseDTO> {
    if (auth.role !== 'trainer') {
      const err = new Error('Somente treinadora pode responder feedbacks.');
      err.name = FORBIDDEN;
      throw err;
    }
    await assertFeedbackViewerAccess(this.feedbacks, feedbackId, auth);
    const fields = parseFeedbackResponseCreateBody(body);
    const created = await this.responses.create({
      feedback_id: feedbackId,
      response: fields.response,
    });
    const feedback = await this.feedbacks.findById(feedbackId);
    if (feedback) {
      try {
        await this.notifier.notifyFeedbackResponseCreated({
          studentId: feedback.student_id,
          trainerId: auth.sub,
          feedbackId,
        });
      } catch (err) {
        console.error('[feedback-response-notifications] notifyFeedbackResponseCreated:', err);
      }
    }
    return created;
  }
}
