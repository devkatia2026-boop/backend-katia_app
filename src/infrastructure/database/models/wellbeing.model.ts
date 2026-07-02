import { DataTypes, Model, Sequelize } from 'sequelize';

export class Wellbeing extends Model {
  declare id: number;
  declare status: boolean | null;
  declare photo: string | null;
  declare tittle: string | null;
  declare tags: string | null;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initWellbeing(sequelize: Sequelize): typeof Wellbeing {
  Wellbeing.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: DataTypes.BOOLEAN,
      photo: DataTypes.TEXT,
      tittle: DataTypes.STRING,
      tags: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'wellbeing',
      modelName: 'Wellbeing',
    }
  );

  return Wellbeing;
}
