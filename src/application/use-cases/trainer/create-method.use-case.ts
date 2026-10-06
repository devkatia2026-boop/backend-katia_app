import { parseMethodCreateBody } from '../../parsing/method-body.parsing';
import type { IMethodsRepository, MethodDTO } from '../../ports/methods.port';

const NOT_FOUND = 'NotFoundException';

export class CreateMethodUseCase {
  constructor(private readonly repo: IMethodsRepository) {}

  async execute(body: unknown): Promise<MethodDTO> {
    const input = parseMethodCreateBody(body);
    const exists = await this.repo.methodProgramExists(input.method_program_id);
    if (!exists) {
      const err = new Error('Programa de método não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return this.repo.create(input);
  }
}
