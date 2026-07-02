import { DataTypes, Model, Sequelize } from 'sequelize';

export class ResponsesFeedback extends Model {
  declare id: number;
  declare feedback_id: number;
  declare response: string | null;
  declare readonly created_at: Date;
}

export function initResponsesFeedback(sequelize: Sequelize): typeof ResponsesFeedback {
  ResponsesFeedback.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      feedback_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      response: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'responsesfeedbacks',
      modelName: 'ResponsesFeedback',
    }
  );

  return ResponsesFeedback;
}
