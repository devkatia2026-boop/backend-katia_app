import { DataTypes, Model, Sequelize } from 'sequelize';

export class Student extends Model {
  declare id: string;
  declare trainer_id: string;
  declare photo_perfil: string | null;
  declare full_name: string;
  declare phone: string | null;
  declare email: string;
  declare birth: string | null;
  declare cpf: string | null;
  declare type_plan: string | null;
  declare height: number | null;
  declare weight: number | null;
  declare refresh_token: string | null;
  declare expo_push_token: string | null;
  declare check_winner: boolean | null;
  declare readonly created_at: Date;
}

export function initStudent(sequelize: Sequelize): typeof Student {
  Student.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      trainer_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      photo_perfil: DataTypes.TEXT,
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      birth: DataTypes.DATEONLY,
      cpf: DataTypes.STRING,
      type_plan: DataTypes.STRING,
      height: DataTypes.FLOAT,
      weight: DataTypes.FLOAT,
      refresh_token: DataTypes.TEXT,
      expo_push_token: DataTypes.TEXT,
      check_winner: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      tableName: 'students',
      modelName: 'Student',
    }
  );

  return Student;
}
