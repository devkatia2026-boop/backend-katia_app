import { DataTypes, Model, Sequelize } from 'sequelize';

export class Trainer extends Model {
  declare id: string;
  declare full_name: string;
  declare photo_perfil: string | null;
  declare phone: string | null;
  declare email: string;
  declare refresh_token: string | null;
  declare expo_push_token: string | null;
  declare check_winner: boolean | null;
  declare readonly created_at: Date;
}

export function initTrainer(sequelize: Sequelize): typeof Trainer {
  Trainer.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photo_perfil: DataTypes.TEXT,
      phone: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refresh_token: DataTypes.TEXT,
      expo_push_token: DataTypes.TEXT,
      check_winner: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      tableName: 'trainers',
      modelName: 'Trainer',
    }
  );

  return Trainer;
}
