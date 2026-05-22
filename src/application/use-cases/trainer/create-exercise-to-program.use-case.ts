import type {
  ExerciseToProgramDTO,
  IExercisesToProgramsRepository,
} from '../../ports/exercises-to-programs.port';
import { parseExerciseToProgramCreateBody } from '../../parsing/exercise-to-program-body.parsing';

export class CreateExerciseToProgramUseCase {
  constructor(private readonly repo: IExercisesToProgramsRepository) {}

  execute(body: unknown): Promise<ExerciseToProgramDTO> {
    const input = parseExerciseToProgramCreateBody(body);
    return this.repo.create(input);
  }
}
