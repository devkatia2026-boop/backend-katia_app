import { DataTypes, Model, Sequelize } from 'sequelize';

export class Anamnesis extends Model {
  declare id: number;
  declare student_id: string;
  declare main_objective: string | null;
  declare place_training: string | null;
  declare days_for_week: string | null;
  declare level_experience: string | null;
  declare bother: string | null;
  declare readonly created_at: Date;
}

export function initAnamnesis(sequelize: Sequelize): typeof Anamnesis {
  Anamnesis.init(
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
      main_objective: DataTypes.STRING,
      place_training: DataTypes.STRING,
      days_for_week: DataTypes.STRING,
      level_experience: DataTypes.STRING,
      bother: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'anamneses',
      modelName: 'Anamnesis',
    }
  );

  return Anamnesis;
}
