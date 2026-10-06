import { DataTypes, Model, Sequelize } from 'sequelize';

export class Content extends Model {
  declare id: number;
  declare introduction_id: number;
  declare link: string;
  declare type: string;
  declare readonly created_at: Date;
}

export function initContent(sequelize: Sequelize): typeof Content {
  Content.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      introduction_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'contents',
      modelName: 'Content',
    }
  );

  return Content;
}
