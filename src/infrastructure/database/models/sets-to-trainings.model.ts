import { DataTypes, Model, Sequelize } from 'sequelize';

/** Liga um `set` a um `training` (muitos registros por par set↔training possível via PK distinta). */
export class SetsToTrainings extends Model {
  declare id: number;
  declare training_id: number;
  declare set_id: number;
  declare readonly created_at: Date;
}

export function initSetsToTrainings(sequelize: Sequelize): typeof SetsToTrainings {
  SetsToTrainings.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      set_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'setstotrainings',
      modelName: 'SetsToTrainings',
    }
  );

  return SetsToTrainings;
}
