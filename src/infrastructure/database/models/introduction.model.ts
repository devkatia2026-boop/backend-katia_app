import { DataTypes, Model, Sequelize } from 'sequelize';

export class Introduction extends Model {
  declare id: number;
  declare program_id: number;
  declare title: string;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initIntroduction(sequelize: Sequelize): typeof Introduction {
  Introduction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'introductions',
      modelName: 'Introduction',
    }
  );

  return Introduction;
}
