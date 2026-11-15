import { DataTypes, Model, Sequelize } from 'sequelize';

export class SubjectWell extends Model {
  declare id: number;
  declare well_id: number;
  declare midia: string;
  declare type: string;
  declare readonly created_at: Date;
}

export function initSubjectWell(sequelize: Sequelize): typeof SubjectWell {
  SubjectWell.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      well_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      midia: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'subjectwells',
      modelName: 'SubjectWell',
    }
  );

  return SubjectWell;
}