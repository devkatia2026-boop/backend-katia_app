import { DataTypes, Model, Sequelize } from 'sequelize';

export class ExercisesToTrainings extends Model {
  declare id: number;
  declare training_id: number;
  declare exercise_id: number;
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
    },
    {
      sequelize,
      tableName: 'exercisestotrainings',
      modelName: 'ExercisesToTrainings',
    }
  );

  return ExercisesToTrainings;
}

