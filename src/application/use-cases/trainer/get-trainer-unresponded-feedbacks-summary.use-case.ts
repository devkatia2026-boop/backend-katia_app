import type {
  IFeedbacksRepository,
  TrainerUnrespondedFeedbacksSummary,
} from '../../ports/feedbacks.port';

export class GetTrainerUnrespondedFeedbacksSummaryUseCase {
  constructor(private readonly repo: IFeedbacksRepository) {}

  async execute(trainerId: string): Promise<TrainerUnrespondedFeedbacksSummary> {
    return this.repo.listUnrespondedSummaryForTrainer(trainerId);
  }
}
