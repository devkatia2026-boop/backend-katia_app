import { DataTypes, Model, Sequelize } from 'sequelize';

export class ObsToTrainings extends Model {
  declare id: number;
  declare training_id: number;
  declare student_id: string;
  declare obs: string | null;
  declare readonly created_at: Date;
}

export function initObsToTrainings(sequelize: Sequelize): typeof ObsToTrainings {
  ObsToTrainings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      obs: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'obstotrainings',
      modelName: 'ObsToTrainings',
    }
  );

  return ObsToTrainings;
}
