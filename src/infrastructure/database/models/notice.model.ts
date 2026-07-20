import { DataTypes, Model, Sequelize } from 'sequelize';

export class Notice extends Model {
  declare id: number;
  declare trainer_id: string;
  declare message: string | null;
  declare type_plan: string;
  declare readonly created_at: Date;
}

export function initNotice(sequelize: Sequelize): typeof Notice {
  Notice.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      trainer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      message: DataTypes.TEXT,
      type_plan: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'notices',
      modelName: 'Notice',
    }
  );

  return Notice;
}
