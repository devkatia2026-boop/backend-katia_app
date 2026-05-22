import { DataTypes, Model, Sequelize } from 'sequelize';

export type ProgramType = 'casa' | 'academia' | 'ambos';
export type ProgramLevel = 'iniciante' | 'intermediário' | 'avançado';

export class Program extends Model {
  declare id: number;
  declare name: string | null;
  declare photo: string | null;
  declare status: boolean | null;
  declare type: string | null;
  declare description: string | null;
  declare level: string | null;
  declare readonly created_at: Date;
}

export function initProgram(sequelize: Sequelize): typeof Program {
  Program.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      photo: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      type: DataTypes.STRING,
      description: DataTypes.STRING,
      level: DataTypes.STRING,
    },
    {
      sequelize,
      tableName: 'programs',
      modelName: 'Program',
    }
  );

  return Program;
}

