import { DataTypes, Model, Sequelize } from 'sequelize';

export class SetsToStudents extends Model {
  declare id: number;
  declare student_id: string;
  declare sets_id: number;
  declare validity: string | null;
  declare status: boolean | null;
  declare readonly created_at: Date;
}

export function initSetsToStudents(sequelize: Sequelize): typeof SetsToStudents {
  SetsToStudents.init(
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
      sets_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      validity: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      tableName: 'setstostudents',
      modelName: 'SetsToStudents',
    }
  );

  return SetsToStudents;
}
