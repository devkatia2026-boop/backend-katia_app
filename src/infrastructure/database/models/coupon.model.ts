import { DataTypes, Model, Sequelize } from 'sequelize';

export class Coupon extends Model {
  declare id: number;
  declare status: boolean | null;
  declare photo: string | null;
  declare site: string | null;
  declare code: string | null;
  declare site_name: string | null;
  declare description: string | null;
  declare readonly created_at: Date;
}

export function initCoupon(sequelize: Sequelize): typeof Coupon {
  Coupon.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      status: DataTypes.BOOLEAN,
      photo: DataTypes.TEXT,
      site: DataTypes.TEXT,
      code: DataTypes.STRING,
      site_name: DataTypes.STRING,
      description: DataTypes.TEXT,
    },
    {
      sequelize,
      tableName: 'coupons',
      modelName: 'Coupon',
    }
  );

  return Coupon;
}
