import { getBrazilDateContext } from '../../parsing/set-order-schedule.parsing';
import type {
  ISetsToStudentsRepository,
  TrainerPastValidityStudentsSummary,
} from '../../ports/sets-to-students.port';

export class ListTrainerPastValidityStudentsUseCase {
  constructor(private readonly repo: ISetsToStudentsRepository) {}

  async execute(trainerId: string): Promise<TrainerPastValidityStudentsSummary> {
    const todayIso = getBrazilDateContext().date;
    return this.repo.listPastValidityStudentsForTrainer(trainerId, todayIso);
  }
}
