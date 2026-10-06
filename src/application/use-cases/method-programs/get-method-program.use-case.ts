import type { IMethodProgramsRepository, MethodProgramDTO } from '../../ports/method-programs.port';

const NOT_FOUND = 'NotFoundException';

export class GetMethodProgramUseCase {
  constructor(private readonly repo: IMethodProgramsRepository) {}

  async execute(id: number): Promise<MethodProgramDTO> {
    const row = await this.repo.findById(id);

    if (!row) {
      const err = new Error('Conteúdo de métodos não encontrado.');
      err.name = NOT_FOUND;
      throw err;
    }

    return row;
  }
}
