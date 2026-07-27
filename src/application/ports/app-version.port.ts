export type AppVersionDTO = {
  version: string;
  created_at: Date;
};

export interface IAppVersionRepository {
  getCurrent(): Promise<AppVersionDTO | null>;
  create(version: string): Promise<AppVersionDTO>;
  updateCurrent(version: string): Promise<AppVersionDTO>;
}
