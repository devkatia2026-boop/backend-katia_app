import {
  parseAppVersionCreateBody,
  parseAppVersionPatchBody,
} from '../../parsing/app-version-body.parsing';
import type { AppVersionDTO, IAppVersionRepository } from '../../ports/app-version.port';

const NOT_FOUND = 'NotFoundException';
const CONFLICT = 'ConflictException';

export class GetAppVersionUseCase {
  constructor(private readonly repo: IAppVersionRepository) {}

  async execute(): Promise<AppVersionDTO> {
    const row = await this.repo.getCurrent();
    if (!row) {
      const err = new Error('Versão do app não cadastrada.');
      err.name = NOT_FOUND;
      throw err;
    }
    return row;
  }
}

export class CreateAppVersionUseCase {
  constructor(private readonly repo: IAppVersionRepository) {}

  async execute(body: unknown): Promise<AppVersionDTO> {
    const { version } = parseAppVersionCreateBody(body);
    try {
      return await this.repo.create(version);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === CONFLICT) throw err;
      throw err;
    }
  }
}

export class UpdateAppVersionUseCase {
  constructor(private readonly repo: IAppVersionRepository) {}

  async execute(body: unknown): Promise<AppVersionDTO> {
    const { version } = parseAppVersionPatchBody(body);
    try {
      return await this.repo.updateCurrent(version);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      if (error.name === NOT_FOUND) throw err;
      throw err;
    }
  }
}
