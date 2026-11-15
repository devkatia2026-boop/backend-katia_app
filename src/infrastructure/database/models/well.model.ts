import { DataTypes, Model, Sequelize } from 'sequelize';

export class Well extends Model {
  declare id: number;
  declare wellbeing_id: number;
  declare status: boolean | null;
  declare tittle: string | null;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initWell(sequelize: Sequelize): typeof Well {
  Well.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wellbeing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: DataTypes.BOOLEAN,
      tittle: DataTypes.TEXT,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'wells',
      modelName: 'Well',
    }
  );

  return Well;
}