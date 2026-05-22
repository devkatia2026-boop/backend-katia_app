import { DataTypes, Model, Sequelize } from 'sequelize';

export class Physical extends Model {
  declare id: number;
  declare student_id: string;
  declare weight: number | null;
  declare height: number | null;
  declare objective: string | null;
  declare readonly created_at: Date;
}

export function initPhysical(sequelize: Sequelize): typeof Physical {
  Physical.init(
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
      weight: DataTypes.FLOAT,
      height: DataTypes.FLOAT,
      objective: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'physicals',
      modelName: 'Physical',
    }
  );

  return Physical;
}
