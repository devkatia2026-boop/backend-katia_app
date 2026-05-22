import { DataTypes, Model, Sequelize } from 'sequelize';

export class Feedback extends Model {
  declare id: number;
  declare student_id: string;
  declare effort: string | null;
  declare feedback: string | null;
  declare readonly created_at: Date;
}

export function initFeedback(sequelize: Sequelize): typeof Feedback {
  Feedback.init(
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
      effort: DataTypes.STRING,
      feedback: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'feedbacks',
      modelName: 'Feedback',
    }
  );

  return Feedback;
}
