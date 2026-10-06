import type { IMethodsRepository, MethodDTO } from '../../ports/methods.port';

const NOT_FOUND = 'NotFoundException';

export class GetMethodUseCase {
  constructor(private readonly repo: IMethodsRepository) {}

  async execute(id: number): Promise<MethodDTO> {
    const row = await this.repo.findById(id);
    if (!row) {
      const err = new Error('Método não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}
