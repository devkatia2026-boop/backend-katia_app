import type { DatabaseModels } from './models';
import type { AppVersionDTO, IAppVersionRepository } from '../../application/ports/app-version.port';

export class SequelizeAppVersionRepository implements IAppVersionRepository {
  constructor(private readonly models: Pick<DatabaseModels, 'AppVersion'>) {}

  async getCurrent(): Promise<AppVersionDTO | null> {
    const row = await this.models.AppVersion.findOne({
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    return row ? (row.toJSON() as AppVersionDTO) : null;
  }

  async create(version: string): Promise<AppVersionDTO> {
    const existing = await this.getCurrent();
    if (existing) {
      const err = new Error('Versão do app já cadastrada. Use PATCH para alterar.');
      err.name = 'ConflictException';
      throw err;
    }
    const row = await this.models.AppVersion.create({ version });
    return row.toJSON() as AppVersionDTO;
  }

  async updateCurrent(version: string): Promise<AppVersionDTO> {
    const current = await this.models.AppVersion.findOne({
      order: [
        ['created_at', 'DESC'],
        ['id', 'DESC'],
      ],
    });
    if (!current) {
      const err = new Error('Versão do app não cadastrada. Use POST para criar.');
      err.name = 'NotFoundException';
      throw err;
    }
    await current.update({ version });
    return current.toJSON() as AppVersionDTO;
  }
}
