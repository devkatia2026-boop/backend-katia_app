export type FeedbackResponseDTO = {
  id: number;
  feedback_id: number;
  response: string | null;
  created_at: Date;
};

export type CreateFeedbackResponseInput = {
  feedback_id: number;
  response: string;
};

export type PatchFeedbackResponseInput = {
  response: string;
};

export interface IFeedbackResponsesRepository {
  findById(responseId: number): Promise<FeedbackResponseDTO | null>;
  listByFeedbackId(feedbackId: number): Promise<FeedbackResponseDTO[]>;
  listGroupedByFeedbackIds(feedbackIds: number[]): Promise<Map<number, FeedbackResponseDTO[]>>;
  create(input: CreateFeedbackResponseInput): Promise<FeedbackResponseDTO>;
  update(responseId: number, patch: PatchFeedbackResponseInput): Promise<FeedbackResponseDTO>;
  deleteById(responseId: number): Promise<boolean>;
}
