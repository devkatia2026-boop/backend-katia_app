import { DataTypes, Model, Sequelize } from 'sequelize';

export class Evolution extends Model {
  declare id: number;
  declare student_id: string;
  declare original_photo: string | null;
  declare current_photo: string | null;
  declare readonly created_at: Date;
}

export function initEvolution(sequelize: Sequelize): typeof Evolution {
  Evolution.init(
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
      original_photo: DataTypes.TEXT,
      current_photo: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'evolutions',
      modelName: 'Evolution',
    }
  );

  return Evolution;
}
