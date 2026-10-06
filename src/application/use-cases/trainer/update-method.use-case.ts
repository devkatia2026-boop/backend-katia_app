import { parseMethodPatchBody } from '../../parsing/method-body.parsing';
import type { IMethodsRepository, MethodDTO } from '../../ports/methods.port';

const NOT_FOUND = 'NotFoundException';

export class UpdateMethodUseCase {
  constructor(private readonly repo: IMethodsRepository) {}

  async execute(id: number, body: unknown): Promise<MethodDTO> {
    const patch = parseMethodPatchBody(body);
    if (patch.method_program_id !== undefined) {
      const exists = await this.repo.methodProgramExists(patch.method_program_id);
      if (!exists) {
        const err = new Error('Programa de método não encontrado.');
        err.name = NOT_FOUND;
        throw err;
      }
    }
    const current = await this.repo.findById(id);
    if (!current) {
      const err = new Error('Método não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.repo.update(id, patch);
  }
}
