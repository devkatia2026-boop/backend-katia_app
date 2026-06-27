import type {
  ITrainingsToProgramsRepository,
  TrainingToProgramDTO,
} from '../../ports/trainings-to-programs.port';
import { parseTrainingToProgramCreateBody } from '../../parsing/training-to-program-body.parsing';

export class CreateTrainingToProgramUseCase {
  constructor(private readonly repo: ITrainingsToProgramsRepository) {}

  execute(body: unknown): Promise<TrainingToProgramDTO> {
    const input = parseTrainingToProgramCreateBody(body);
    return this.repo.create(input);
  }
}
