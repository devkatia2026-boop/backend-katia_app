import { DataTypes, Model, Sequelize } from 'sequelize';

export class Division extends Model {
  declare id: number;
  declare student_id: string;
  declare division: string | null;
  declare readonly created_at: Date;
}

export function initDivision(sequelize: Sequelize): typeof Division {
  Division.init(
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
      division: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'divisions',
      modelName: 'Division',
    }
  );

  return Division;
}

