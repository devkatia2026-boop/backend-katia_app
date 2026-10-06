import { DataTypes, Model, Sequelize } from 'sequelize';

export class MethodProgram extends Model {
  declare id: number;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initMethodProgram(sequelize: Sequelize): typeof MethodProgram {
  MethodProgram.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'methodprograms',
      modelName: 'MethodProgram',
    }
  );

  return MethodProgram;
}
