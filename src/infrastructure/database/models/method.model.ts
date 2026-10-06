import { DataTypes, Model, Sequelize } from 'sequelize';

export class Method extends Model {
  declare id: number;
  declare method_program_id: number;
  declare title: string;
  declare link: string;
  declare readonly created_at: Date;
}

export function initMethod(sequelize: Sequelize): typeof Method {
  Method.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      method_program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      link: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'methods',
      modelName: 'Method',
    }
  );

  return Method;
}
