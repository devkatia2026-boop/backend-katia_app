import { Sequelize } from 'sequelize';
import { getDatabaseConfig, getDatabaseDialectOptions } from './config/database.config';

const cfg = getDatabaseConfig();
const dialectOptions = getDatabaseDialectOptions();

export const sequelize = new Sequelize(cfg.database, cfg.username, cfg.password, {
  host: cfg.host,
  port: cfg.port,
  dialect: cfg.dialect,
  ...(dialectOptions ? { dialectOptions } : {}),
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  },
});
