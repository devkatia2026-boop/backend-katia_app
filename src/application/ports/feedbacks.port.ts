import type { PagedList } from './social-feed.port';
import type { FeedbackResponseDTO } from './feedback-responses.port';

export type TrainingFeedbackStudentBrief = {
  id: string;
  full_name: string;
};

/** Registro na tabela `feedbacks` (esforço + texto); inclui objeto aninhado `feedback` só na listagem do treinador. */
export type TrainingFeedbackDTO = {
  id: number;
  student_id: string;
  effort: string | null;
  feedback: string | null;
  created_at: Date;
  student: TrainingFeedbackStudentBrief | null;
  responses: FeedbackResponseDTO[];
};

export type CreateTrainingFeedbackInput = {
  student_id: string;
  effort: string | null;
  feedback: string | null;
};

export type TrainerUnrespondedFeedbackStudentItem = {
  student_id: string;
  student_name: string;
  unresponded_count: number;
};

export type TrainerUnrespondedFeedbacksSummary = {
  total: number;
  student_ids: string[];
  items: TrainerUnrespondedFeedbackStudentItem[];
};

export interface IFeedbacksRepository {
  listForViewer(
    page: number,
    pageSize: number,
    viewer: { role: 'student' | 'trainer'; sub: string },
    filterStudentId: string | undefined
  ): Promise<PagedList<TrainingFeedbackDTO>>;
  findById(id: number): Promise<TrainingFeedbackDTO | null>;
  getStudentTrainerBrief(
    studentId: string
  ): Promise<{ trainer_id: string; full_name: string } | null>;
  create(input: CreateTrainingFeedbackInput): Promise<TrainingFeedbackDTO>;
  listUnrespondedSummaryForTrainer(
    trainerId: string
  ): Promise<TrainerUnrespondedFeedbacksSummary>;
}
