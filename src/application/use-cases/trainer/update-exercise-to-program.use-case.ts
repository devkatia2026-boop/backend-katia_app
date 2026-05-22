import type {
  ExerciseToProgramDTO,
  IExercisesToProgramsRepository,
} from '../../ports/exercises-to-programs.port';
import { parseExerciseToProgramPatchBody } from '../../parsing/exercise-to-program-body.parsing';

export class UpdateExerciseToProgramUseCase {
  constructor(private readonly repo: IExercisesToProgramsRepository) {}

  execute(id: number, body: unknown): Promise<ExerciseToProgramDTO> {
    const patch = parseExerciseToProgramPatchBody(body);
    return this.repo.update(id, patch);
  }
}
