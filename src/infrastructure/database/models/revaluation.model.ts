import { DataTypes, Model, Sequelize } from 'sequelize';

export class Revaluation extends Model {
  declare id: number;
  declare student_id: string;
  declare front_photo: string | null;
  declare side_photo: string | null;
  declare back_photo: string | null;
  declare current_weight: number | null;
  declare monthly_rating: string | null;
  declare biggest_achievement: string | null;
  declare biggest_challenge: string | null;
  declare training_fit_routine: boolean | null;
  declare favorite_workout: string | null;
  declare least_favorite_or_difficult_exercise: string | null;
  declare nutrition_rating: string | null;
  declare energy_rating: number | null;
  declare body_changes: string | null;
  declare pain_or_adjustments: string | null;
  declare next_month_goal: string | null;
  declare proudest_moment: string | null;
  declare trainer_view: boolean;
  declare readonly created_at: Date;
}

export function initRevaluation(sequelize: Sequelize): typeof Revaluation {
  Revaluation.init(
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
      front_photo: DataTypes.TEXT,
      side_photo: DataTypes.TEXT,
      back_photo: DataTypes.TEXT,
      current_weight: DataTypes.FLOAT,
      monthly_rating: DataTypes.TEXT,
      biggest_achievement: DataTypes.TEXT,
      biggest_challenge: DataTypes.TEXT,
      training_fit_routine: DataTypes.BOOLEAN,
      favorite_workout: DataTypes.TEXT,
      least_favorite_or_difficult_exercise: DataTypes.TEXT,
      nutrition_rating: DataTypes.TEXT,
      energy_rating: DataTypes.INTEGER,
      body_changes: DataTypes.TEXT,
      pain_or_adjustments: DataTypes.TEXT,
      next_month_goal: DataTypes.TEXT,
      proudest_moment: DataTypes.TEXT,
      trainer_view: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'revaluations',
      modelName: 'Revaluation',
    }
  );

  return Revaluation;
}
