import { DataTypes, Model, Sequelize } from 'sequelize';

export class RepsToExercises extends Model {
  declare id: number;
  declare exercise_id: number;
  declare student_id: string;
  declare reps: string | null;
  declare obs: string | null;
  declare readonly created_at: Date;
}

export function initRepsToExercises(sequelize: Sequelize): typeof RepsToExercises {
  RepsToExercises.init(
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
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reps: DataTypes.STRING,
      obs: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'repstoexercises',
      modelName: 'RepsToExercises',
    }
  );

  return RepsToExercises;
}
