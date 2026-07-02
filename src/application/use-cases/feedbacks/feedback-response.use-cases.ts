import { parseFeedbackResponsePatchBody } from '../../parsing/feedback-response-body.parsing';
import type { FeedbackResponseDTO, IFeedbackResponsesRepository } from '../../ports/feedback-responses.port';
import type { IFeedbacksRepository } from '../../ports/feedbacks.port';
import { assertFeedbackViewerAccess } from './assert-feedback-viewer-access';

const NOT_FOUND = 'NotFoundException';
const FORBIDDEN = 'ForbiddenException';

export class UpdateFeedbackResponseUseCase {
  constructor(
    private readonly feedbacks: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository
  ) {}

  async execute(
    feedbackId: number,
    responseId: number,
    body: unknown,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<FeedbackResponseDTO> {
    if (auth.role !== 'trainer') {
      const err = new Error('Somente treinadora pode editar respostas.');
      err.name = FORBIDDEN;
      throw err;
    }
    await assertFeedbackViewerAccess(this.feedbacks, feedbackId, auth);
    const existing = await this.responses.findById(responseId);
    if (!existing || existing.feedback_id !== feedbackId) {
      const err = new Error('Resposta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const patch = parseFeedbackResponsePatchBody(body);
    return this.responses.update(responseId, patch);
  }
}

export class DeleteFeedbackResponseUseCase {
  constructor(
    private readonly feedbacks: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository
  ) {}

  async execute(
    feedbackId: number,
    responseId: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<void> {
    if (auth.role !== 'trainer') {
      const err = new Error('Somente treinadora pode excluir respostas.');
      err.name = FORBIDDEN;
      throw err;
    }
    await assertFeedbackViewerAccess(this.feedbacks, feedbackId, auth);
    const existing = await this.responses.findById(responseId);
    if (!existing || existing.feedback_id !== feedbackId) {
      const err = new Error('Resposta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    const deleted = await this.responses.deleteById(responseId);
    if (!deleted) {
      const err = new Error('Resposta não encontrada.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}

export class ListFeedbackResponsesUseCase {
  constructor(
    private readonly feedbacks: IFeedbacksRepository,
    private readonly responses: IFeedbackResponsesRepository
  ) {}

  async execute(
    feedbackId: number,
    auth: { role: 'student' | 'trainer'; sub: string }
  ): Promise<FeedbackResponseDTO[]> {
    await assertFeedbackViewerAccess(this.feedbacks, feedbackId, auth);
    return this.responses.listByFeedbackId(feedbackId);
  }
}
