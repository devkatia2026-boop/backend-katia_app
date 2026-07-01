import { DataTypes, Model, Sequelize } from 'sequelize';

export class Point extends Model {
  declare id: number;
  declare student_id: string;
  declare time: string | null;
  declare qtt_excercise: number | null;
  declare goal: number | null;
  declare name_training: string | null;
  declare readonly created_at: Date;
}

export function initPoint(sequelize: Sequelize): typeof Point {
  Point.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      time: DataTypes.STRING,
      qtt_excercise: DataTypes.INTEGER,
      goal: DataTypes.INTEGER,
      name_training: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'points',
      modelName: 'Point',
    }
  );

  return Point;
}
