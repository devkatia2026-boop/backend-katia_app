import { DataTypes, Model, Sequelize } from 'sequelize';

export class ProgramsToStudents extends Model {
  declare id: number;
  declare student_id: string;
  declare program_id: number;
  declare readonly created_at: Date;
}

export function initProgramsToStudents(sequelize: Sequelize): typeof ProgramsToStudents {
  ProgramsToStudents.init(
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
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'programstostudents',
      modelName: 'ProgramsToStudents',
    }
  );

  return ProgramsToStudents;
}
