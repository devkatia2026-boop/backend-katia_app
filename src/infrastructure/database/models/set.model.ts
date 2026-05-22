import { DataTypes, Model, Sequelize } from 'sequelize';

export class Set extends Model {
  declare id: number;
  declare name: string | null;
  declare order: string | null;
  declare readonly created_at: Date;
}

export function initSet(sequelize: Sequelize): typeof Set {
  Set.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      order: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'sets',
      modelName: 'Set',
    }
  );

  return Set;
}

