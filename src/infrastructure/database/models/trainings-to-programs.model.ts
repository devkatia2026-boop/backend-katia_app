import { DataTypes, Model, Sequelize } from 'sequelize';

export class TrainingsToPrograms extends Model {
  declare id: number;
  declare program_id: number;
  declare training_id: number;
  declare readonly created_at: Date;
}

export function initTrainingsToPrograms(sequelize: Sequelize): typeof TrainingsToPrograms {
  TrainingsToPrograms.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      training_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'programstotrainings',
      modelName: 'TrainingsToPrograms',
    }
  );

  return TrainingsToPrograms;
}
