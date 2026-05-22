import { DataTypes, Model, Sequelize } from 'sequelize';

export class Like extends Model {
  declare id: number;
  declare post_id: number;
  declare author_id: string | null;
  declare author_type: string | null;
  declare readonly created_at: Date;
}

export function initLike(sequelize: Sequelize): typeof Like {
  Like.init(
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
    },
    {
      sequelize,
      tableName: 'likes',
      modelName: 'Like',
    }
  );

  return Like;
}
