import { DataTypes, Model, Sequelize } from 'sequelize';

export class AppVersion extends Model {
  declare id: number;
  declare version: string;
  declare readonly created_at: Date;
}

export function initAppVersion(sequelize: Sequelize): typeof AppVersion {
  AppVersion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'version',
      modelName: 'AppVersion',
    }
  );

  return AppVersion;
}
