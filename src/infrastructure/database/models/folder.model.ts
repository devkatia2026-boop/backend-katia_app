import { DataTypes, Model, Sequelize } from 'sequelize';

export class Folder extends Model {
  declare id: number;
  declare title: string;
  declare type: string;
  declare readonly created_at: Date;
}

export function initFolder(sequelize: Sequelize): typeof Folder {
  Folder.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'folders',
      modelName: 'Folder',
    }
  );

  return Folder;
}
