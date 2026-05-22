import { DataTypes, Model, Sequelize } from 'sequelize';

export class ExercisesToPrograms extends Model {
  declare id: number;
  declare program_id: number;
  declare exercise_id: number;
  declare readonly created_at: Date;
}

export function initExercisesToPrograms(sequelize: Sequelize): typeof ExercisesToPrograms {
  ExercisesToPrograms.init(
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
      exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'exercisestoprograms',
      modelName: 'ExercisesToPrograms',
    }
  );

  return ExercisesToPrograms;
}

