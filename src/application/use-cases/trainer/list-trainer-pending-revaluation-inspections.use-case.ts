import type {
  IRevaluationsRepository,
  RevaluationPendingInspectionItem,
} from '../../ports/revaluations.port';

export type ListTrainerPendingRevaluationInspectionsResult = {
  items: RevaluationPendingInspectionItem[];
};

export class ListTrainerPendingRevaluationInspectionsUseCase {
  constructor(private readonly repo: IRevaluationsRepository) {}

  async execute(trainerId: string): Promise<ListTrainerPendingRevaluationInspectionsResult> {
    const items = await this.repo.listPendingInspectionsForTrainer(trainerId);
    return { items };
  }
}
