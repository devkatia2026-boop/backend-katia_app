import { DataTypes, Model, Sequelize } from 'sequelize';

export class FoldersToType extends Model {
  declare id: number;
  declare folder_id: number;
  declare training_id: number | null;
  declare exercise_id: number | null;
  declare set_id: number | null;
  declare type: string;
  declare readonly created_at: Date;
}

export function initFoldersToType(sequelize: Sequelize): typeof FoldersToType {
  FoldersToType.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      folder_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      training_id: DataTypes.INTEGER,
      exercise_id: DataTypes.INTEGER,
      set_id: DataTypes.INTEGER,
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'folderstotype',
      modelName: 'FoldersToType',
    }
  );

  return FoldersToType;
}
