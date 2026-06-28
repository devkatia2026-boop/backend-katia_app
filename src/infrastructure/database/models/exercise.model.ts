import { DataTypes, Model, Sequelize } from 'sequelize';

export type ExerciseType = 'casa' | 'academia' | 'ambos';
export type ExerciseLevel = 'iniciante' | 'intermediário' | 'avançado';

export class Exercise extends Model {
  declare id: number;
  declare name: string | null;
  declare video: string | null;
  declare type: string | null;
  declare description: string | null;
  declare level: string | null;
  declare readonly created_at: Date;
}

export function initExercise(sequelize: Sequelize): typeof Exercise {
  Exercise.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      video: DataTypes.TEXT,
      type: DataTypes.STRING,
      description: DataTypes.TEXT,
      level: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'exercises',
      modelName: 'Exercise',
    }
  );

  return Exercise;
}

