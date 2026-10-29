import { DataTypes, Model, Sequelize } from 'sequelize';

export class Restriction extends Model {
  declare id: string;
  declare author_id: string;
  declare author_type: string;
  declare restriction_type: string;
  declare target_id: string | null;
  declare target_type: string | null;
  declare post_id: number | null;
  declare comment_id: number | null;
  declare content_type: string | null;
  declare readonly created_at: Date;
}

export function initRestriction(sequelize: Sequelize): typeof Restriction {
  Restriction.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      author_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      author_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      restriction_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      target_id: DataTypes.UUID,
      target_type: DataTypes.STRING,
      post_id: DataTypes.INTEGER,
      comment_id: DataTypes.INTEGER,
      content_type: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'restrictions',
      modelName: 'Restriction',
    }
  );

  return Restriction;
}
