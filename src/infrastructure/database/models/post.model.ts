import { DataTypes, Model, Sequelize } from 'sequelize';

export type PostAuthorType = 'student' | 'trainer';

export class Post extends Model {
  declare id: number;
  declare author_id: string | null;
  declare author_type: string | null;
  declare image: string | null;
  declare content: string | null;
  declare readonly created_at: Date;
}

export function initPost(sequelize: Sequelize): typeof Post {
  Post.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      author_id: DataTypes.UUID,
      author_type: DataTypes.STRING,
      image: DataTypes.TEXT,
      content: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'posts',
      modelName: 'Post',
    }
  );

  return Post;
}
