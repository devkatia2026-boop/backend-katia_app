import type { IMethodsRepository } from '../../ports/methods.port';

const NOT_FOUND = 'NotFoundException';

export class DeleteMethodUseCase {
  constructor(private readonly repo: IMethodsRepository) {}

  async execute(id: number): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) {
      const err = new Error('Método não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }
  }
}
