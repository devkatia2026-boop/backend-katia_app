import { DataTypes, Model, Sequelize } from 'sequelize';

export class RepsToTrainings extends Model {
  declare id: number;
  declare exercise_id: number;
  declare training_id: number;
  declare reps: string | null;
  declare obs: string | null;
  declare methodology: string | null;
  declare rest: string | null;
  declare readonly created_at: Date;
}

export function initRepsToTrainings(sequelize: Sequelize): typeof RepsToTrainings {
  RepsToTrainings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reps: DataTypes.STRING,
      obs: DataTypes.TEXT,
      methodology: DataTypes.STRING,
      rest: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'repstotrainings',
      modelName: 'RepsToTrainings',
    }
  );

  return RepsToTrainings;
}
