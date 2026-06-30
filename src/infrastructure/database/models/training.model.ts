import { DataTypes, Model, Sequelize } from 'sequelize';

export class Training extends Model {
  declare id: number;
  declare lyric: string | null;
  declare description: string | null;
  declare time: number;
  declare type: string;
  declare muscles: string | null;
  declare readonly created_at: Date;
}

export function initTraining(sequelize: Sequelize): typeof Training {
  Training.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      lyric: DataTypes.STRING,
      description: DataTypes.TEXT,
      time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 45,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Casa/Academia',
      },
      muscles: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'trainings',
      modelName: 'Training',
    }
  );

  return Training;
}

