import type { IFeedbacksRepository, TrainingFeedbackDTO } from '../../ports/feedbacks.port';
import type { IFeedbackResponsesRepository } from '../../ports/feedback-responses.port';
import { assertFeedbackViewerAccess } from './assert-feedback-viewer-access';

export class GetFeedbackUseCase {
  constructor(
    private readonly repo: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository
  ) {}

  async execute(
    id: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<TrainingFeedbackDTO> {
    const row = await assertFeedbackViewerAccess(this.repo, id, auth);
    const feedbackResponses = await this.responses.listByFeedbackId(id);
    return { ...row, responses: feedbackResponses };
  }
}
