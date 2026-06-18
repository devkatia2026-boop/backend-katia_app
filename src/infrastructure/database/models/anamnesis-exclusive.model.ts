import { DataTypes, Model, Sequelize } from 'sequelize';

export class AnamnesisExclusive extends Model {
  declare id: number;
  declare student_id: string;
  declare full_name: string | null;
  declare adress: string | null;
  declare birth: string | null;
  declare city_country: string | null;
  declare profession: string | null;
  declare whatsapp: string | null;
  declare instagram: string | null;
  declare indication: string | null;
  declare link_medical_request: string | null;
  declare weight: number | null;
  declare heigth: number | null;
  declare waist: number | null;
  declare abdomen: number | null;
  declare hip: number | null;
  declare photos_posture: string | null;
  declare photos_up_leg: string | null;
  declare photos_up_arms: string | null;
  declare photos_up_leg_dois: string | null;
  declare photos_sit: string | null;
  declare have_a_children: boolean | null;
  declare objective: string | null;
  declare nutritional_monitoring: string | null;
  declare link_food_planning: string | null;
  declare biggest_challenge: string | null;
  declare already_training: string | null;
  declare weekly_training_quantity: number | null;
  declare time_training: number | null;
  declare pain: string | null;
  declare link_current_workout: string | null;
  declare level_trianing: number | null;
  declare link_woman_inspiration: string | null;
  declare reason: string | null;
  declare size_shirt: string | null;
  declare size_leggin: string | null;
  declare size_top: string | null;
  declare number_shoe: number | null;
  declare readonly created_at: Date;
}

export function initAnamnesisExclusive(sequelize: Sequelize): typeof AnamnesisExclusive {
  AnamnesisExclusive.init(
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
      full_name: DataTypes.STRING,
      adress: DataTypes.STRING,
      birth: DataTypes.STRING,
      city_country: DataTypes.STRING,
      profession: DataTypes.STRING,
      whatsapp: DataTypes.STRING,
      instagram: DataTypes.STRING,
      indication: DataTypes.STRING,
      link_medical_request: DataTypes.STRING,
      weight: DataTypes.FLOAT,
      heigth: DataTypes.FLOAT,
      waist: DataTypes.FLOAT,
      abdomen: DataTypes.FLOAT,
      hip: DataTypes.FLOAT,
      photos_posture: DataTypes.TEXT,
      photos_up_leg: DataTypes.TEXT,
      photos_up_arms: DataTypes.TEXT,
      photos_up_leg_dois: DataTypes.TEXT,
      photos_sit: DataTypes.STRING,
      have_a_children: DataTypes.BOOLEAN,
      objective: DataTypes.TEXT,
      nutritional_monitoring: DataTypes.TEXT,
      link_food_planning: DataTypes.STRING,
      biggest_challenge: DataTypes.TEXT,
      already_training: DataTypes.TEXT,
      weekly_training_quantity: DataTypes.INTEGER,
      time_training: DataTypes.INTEGER,
      pain: DataTypes.TEXT,
      link_current_workout: DataTypes.STRING,
      level_trianing: DataTypes.INTEGER,
      link_woman_inspiration: DataTypes.STRING,
      reason: DataTypes.TEXT,
      size_shirt: DataTypes.STRING,
      size_leggin: DataTypes.STRING,
      size_top: DataTypes.STRING,
      number_shoe: DataTypes.INTEGER,
    },
    {
      sequelize,
      tableName: 'anamnesisexclusive',
      modelName: 'AnamnesisExclusive',
    }
  );

  return AnamnesisExclusive;
}
