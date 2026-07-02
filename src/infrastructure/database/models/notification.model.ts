import { DataTypes, Model, Sequelize } from 'sequelize';

export class Notification extends Model {
  declare id: number;
  declare student_id: string | null;
  declare trainer_id: string | null;
  declare title: string;
  declare message: string;
  declare read: boolean;
  declare type: string;
  declare data: Record<string, unknown> | null;
  declare readonly created_at: Date;
}

export function initNotification(sequelize: Sequelize): typeof Notification {
  Notification.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      student_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      trainer_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: 'notifications',
      modelName: 'Notification',
    }
  );

  return Notification;
}
