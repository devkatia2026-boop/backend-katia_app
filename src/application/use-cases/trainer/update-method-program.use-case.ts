import { parseMethodProgramPatchBody } from '../../parsing/method-program-body.parsing';
import type { IMethodProgramsRepository, MethodProgramDTO } from '../../ports/method-programs.port';

export class UpdateMethodProgramUseCase {
  constructor(private readonly repo: IMethodProgramsRepository) {}

  execute(id: number, body: unknown): Promise<MethodProgramDTO> {
    const patch = parseMethodProgramPatchBody(body);
    return this.repo.update(id, patch);
  }
}
