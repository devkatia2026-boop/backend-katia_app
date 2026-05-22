import { DataTypes, Model, Sequelize } from 'sequelize';

export class Comment extends Model {
  declare id: number;
  declare post_id: number;
  declare author_id: string | null;
  declare author_type: string | null;
  declare content: string | null;
  declare readonly created_at: Date;
}

export function initComment(sequelize: Sequelize): typeof Comment {
  Comment.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      post_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      author_id: DataTypes.UUID,
      author_type: DataTypes.STRING,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'comments',
      modelName: 'Comment',
    }
  );

  return Comment;
}
