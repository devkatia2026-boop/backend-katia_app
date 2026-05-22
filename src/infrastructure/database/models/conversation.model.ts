import { DataTypes, Model, Sequelize } from 'sequelize';

export class Conversation extends Model {
  declare id: number;
  declare student_id: string;
  declare trainer_message: string | null;
  declare student_message: string | null;
  declare readonly created_at: Date;
}

export function initConversation(sequelize: Sequelize): typeof Conversation {
  Conversation.init(
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
      trainer_message: DataTypes.TEXT,
      student_message: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'conversations',
      modelName: 'Conversation',
    }
  );

  return Conversation;
}
