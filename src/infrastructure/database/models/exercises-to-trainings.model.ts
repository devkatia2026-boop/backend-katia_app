import { DataTypes, Model, Sequelize } from 'sequelize';

export class ExercisesToTrainings extends Model {
  declare id: number;
  declare training_id: number;
  declare exercise_id: number;
  declare sort_order: number;
  declare readonly created_at: Date;
}

export function initExercisesToTrainings(sequelize: Sequelize): typeof ExercisesToTrainings {
  ExercisesToTrainings.init(
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
      exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      tableName: 'exercisestotrainings',
      modelName: 'ExercisesToTrainings',
    }
  );

  return ExercisesToTrainings;
}

